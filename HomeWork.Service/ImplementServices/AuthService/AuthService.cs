
using HomeWork.Domain.Interfaces.Services.AuthService;
using HomeWork.Domain.Interfaces.Services.TokenService;
using HomeWork.Domain.RequestModels.AuthRequestModel;
using HomeWork.Domain.RequestModels.RefreshTokenRequestModel;
using HomeWork.Domain.ResponseModels.AuthResponseModel;
using HomeWork.Domain.Models;
using HomeWork.Domain.Share.Errors;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using HomeWork.Service.Helper;

namespace HomeWork.Service.ImplementServices.AuthService
{
    public class AuthService : IAuthService
    {
        CustomError error = new CustomError();
        private readonly connexContext _context;
        private readonly IConfiguration _config;
        private readonly ITokenService _tokenService;

        public AuthService(connexContext context, IConfiguration config, ITokenService tokenService)
        {
            _config = config;
            _context = context;
            _tokenService = tokenService;
        }
        public async Task<LoginResponseModel> LoginAsync(LoginRequestModel request)
        {

            if (string.IsNullOrWhiteSpace(request.Username))
            {
                error.AddErrorKeyAndToast("username", "กรุณากรอก username");
            }
            if (string.IsNullOrWhiteSpace(request.Password))
            {
                error.AddErrorKeyAndToast("password", "กรุณากรอก password");
            }
            error.ThrowIfError();
            string hashPassword = CommonHelper.ComputeSHA512(request.Password);

            var user = await _context.Users
                .Include(user => user.UserRoles)
                .FirstOrDefaultAsync(x => x.Username == request.Username && x.PasswordHash == hashPassword);

            if (user == null)
            {
                error.AddError("username หรือ password ไม่ถูกต้องกรุณาลองใหม่อีกครั้ง");
                error.ThrowIfError();
            }

            DateTime timeNow = DateTime.UtcNow;


            user.LastCheckin = timeNow;
            // ให้ Shared Service ออกบัตรให้
            string accessToken, refreshToken;
            SetJWTTokenService(user, out accessToken, out refreshToken);

            var dbToken = new Token
            {
                UserId = user.UserId,
                CreatedBy = user.UserId,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiryTime = timeNow.AddMinutes(2),
                RefreshTokenExpiryTime = timeNow.AddMinutes(10)
            };
            _context.Tokens.Add(dbToken);
           
            await _context.SaveChangesAsync();
            return new LoginResponseModel();

            
        }

        public async Task<LoginResponseModel> RefreshTokenAsync()
        {
            DateTime timeNow = DateTime.UtcNow;
            var oldTokens = _tokenService.GetCurrentToken();
            if (string.IsNullOrEmpty(oldTokens.RefreshToken) || string.IsNullOrEmpty(oldTokens.AccessToken))
                return null; // ไม่มี Token ใน Cookie ให้กลับไปหน้า Login

            var saveToken = await _context.Tokens.FirstOrDefaultAsync(t =>
                t.RefreshToken == oldTokens.RefreshToken &&
                t.AccessToken == oldTokens.AccessToken
            );

            if (saveToken == null) return null; // ไม่มี Token ใน Database ให้กลับไปหน้า Login

            if (saveToken.RevokeAt != null)
            {
                _tokenService.RemoveHttpToken();
                return null; // Token ถูกเพิกถอนแล้ว ให้กลับไปหน้า Login
            }
            // ตรวจสอบว่า Refresh Token หมดอายุหรือยัง
            if (saveToken.RefreshTokenExpiryTime <= timeNow)
            {
                _context.Tokens.Remove(saveToken);
                await _context.SaveChangesAsync();
                return null;
            }
            ;

            var user = await _context.Users
                .Include(user => user.UserRoles)
                .FirstOrDefaultAsync(user => user.UserId == saveToken.UserId);
            if (user == null) return null;

            // ออกบัตรใหม่ให้ผู้ใช้
            string accessToken, refreshToken;
            SetJWTTokenService(user, out accessToken, out refreshToken);

            saveToken.AccessToken = accessToken;
            saveToken.RefreshToken = refreshToken;
            saveToken.AccessTokenExpiryTime = timeNow.AddMinutes(2);
            await _context.SaveChangesAsync();

            return new LoginResponseModel
            {
                Message = "Token Refreshed Successfully"
            };
        }

      

        public async Task<bool> LogoutAsync()
        {
            var token = _tokenService.GetCurrentToken();
            if(!string.IsNullOrEmpty(token.AccessToken) && !string.IsNullOrEmpty(token.RefreshToken))
            {
                var junkToken = await _context.Tokens.FirstOrDefaultAsync(t =>
                    t.RefreshToken == token.RefreshToken
                );
                if (junkToken != null)
                {
                    junkToken.RevokeAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }
            _tokenService.RemoveHttpToken();

            return true;
        }


        public async Task<bool> IsSessionValid(IsSessionValidRequestModel request)
        {
           var storedToken = await _context.Tokens
                .AsNoTracking()
                .FirstOrDefaultAsync(token => token.UserId == request.userId && token.AccessToken == request.accessToken);
            return storedToken != null  && storedToken.RevokeAt ==null;
        }

        public async Task<UserProfileResponseModel> GetCurrentUserProfileAsync()
        {
            try
            {
                var currentUser = _tokenService.GetCurrentUser();

                if(currentUser == null )
                {
                   error.AddError("ไม่มีผู้ใช้ในระบบ กรุณาเข้าสู่ระบบใหม่");
                    error.ThrowIfError();
                }

                var user = await _context.Users
                    .Include(user => user.UserRoles)
                    .FirstOrDefaultAsync(user => user.UserId == currentUser.UserId);


                if (user == null) 
                {
                    error.AddError("ไม่พบผู้ใช้นี้ กรุณาลองใหม่อีกครั้ง"); // ไม่มีผู้ใช้ใน Database ให้กลับไปหน้า Login
                    error.ThrowIfError();
                }

                List<string> Roles = user.UserRoles.Select(role => role.RoleCode).ToList();

                return new UserProfileResponseModel
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Roles = Roles
                };
            }
            catch (Exception ex)
            {
                error.AddError("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
                error.ThrowIfError();
                return null;
            }
        }

        public async Task<bool> RevokeAllTokensAsync(int userId)
        {
            // หา Token ทั้งหมดของผู้ใช้ใน Database แล้วทำการเพิกถอน (Revoke) โดยการตั้งค่า RevokeAt เป็นเวลาปัจจุบัน
            var activeTokens = await _context.Tokens
                .Where(token => token.UserId == userId && token.RevokeAt == null)
                .ToListAsync();
            if (!activeTokens.Any()) return true; //ไม่มีก็เตะถือว่าได้เหมือนกัน

            foreach (var token in activeTokens)
            {
                token.RevokeAt = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
            return true;
        }





        public async Task<string> RegisterAsync(RegisterRequestModel request)
        {

            // 1. ตรวจสอบข้อมูล (Validation Rules)
            var isUserExist = await _context.Users.AnyAsync(u => u.Username == request.Username);
            ValidateRegister(request);
            if (isUserExist)
            {
                error.AddErrorKeyAndToast("username", "Username นี้มีผู้ใช้งานแล้ว");
            }
            error.ThrowIfError();


            DateOnly? birthDateOnly = null;
            if (DateTime.TryParse(request.BirthDate, out DateTime parsedBirthDate))
            {
                birthDateOnly = DateOnly.FromDateTime(parsedBirthDate);
            }

            var newUser = new User
            {
                Username = request.Username,
                PasswordHash = CommonHelper.ComputeSHA512(request.Password),
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                BirthDate = birthDateOnly,
                CreatedAt = DateTime.UtcNow
            };
            var userRole = new UserRole
            {
                RoleCode = "member",
                User = newUser
            };

            _context.UserRoles.Add(userRole);
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return "สมัครสมาชิกสำเร็จ!";
        }

        private void ValidateRegister(RegisterRequestModel request)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
            {
                error.AddErrorKeyAndToast("username", "กรุณากรอก username");
            }
            else if (request.Username.Length > 200)
            {
                error.AddErrorKeyAndToast("username", "ความยาวห้ามเกิน 200");
            }
            else if (CommonHelper.ContainsEmoji(request.Username))
            {
                error.AddErrorKeyAndToast("username", "ห้ามใส่ emoji");
            }
            if (request.Password != request.ConfirmPassword)
            {
                error.AddError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
            }
            if (request.Phone?.Length > 10 || !request.Phone.All(char.IsDigit))
            {
                error.AddErrorKeyAndToast("phone", "เบอร์โทรศัพท์ต้องเป็นตัวเลข และความยาวไม่เกิน 10 หลัก");
            }
            if (int.TryParse(request.Age, out int age))
            {
                if (age < 1 || age > 100)
                    error.AddErrorKeyAndToast("age", "อายุต้องอยู่ระหว่าง 1 ถึง 100 ปี");
            }
            else
            {
                error.AddErrorKeyAndToast("age", "รูปแบบอายุไม่ถูกต้อง");
            }
            if (string.IsNullOrWhiteSpace(request.FirstName))
            {
                error.AddErrorKeyAndToast("firstname", "กรุณากรอกชื่อจริง");
            }
            else if (CommonHelper.ContainsEmoji(request.FirstName))
            {
                error.AddErrorKeyAndToast("firstname", "ห้ามใส่ emoji");
            }
            else if (request.FirstName.Length > 200)
            {
                error.AddErrorKeyAndToast("firstname", "ความยาวห้ามเกิน 200");
            }
            if (string.IsNullOrWhiteSpace(request.LastName))
            {
                error.AddErrorKeyAndToast("lastname", "กรุณากรอกนามสกุล");
            }
            else if (CommonHelper.ContainsEmoji(request.LastName))
            {
                error.AddErrorKeyAndToast("lastname", "ห้ามใส่ emoji");
            }
            else if (request.LastName.Length > 200)
            {
                error.AddErrorKeyAndToast("lastname", "ความยาวห้ามเกิน 200");
            }
        }

       

       
        private void SetJWTTokenService(User user, out string accessToken, out string refreshToken)
        {
            List<string> userRoles = user.UserRoles.Select(user => user.RoleCode).ToList();

            var jwtModel = new JwtTokenModel
            {
                UserId = user.UserId,
                Username = user.Username,
                Roles = userRoles
            };

            accessToken = _tokenService.GenerateToken(jwtModel);
            refreshToken = _tokenService.GenerateRefreshToken();
            _tokenService.SetHttpToken(new SetTokenRequest()
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });
        }

    }
}
