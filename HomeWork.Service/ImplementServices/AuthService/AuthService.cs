
using HomeWork.Domain.Interfaces.Services.AuthService;
using HomeWork.Domain.Interfaces.Services.TokenService;
using HomeWork.Domain.RequestModels.AuthRequestModel;
using HomeWork.Domain.RequestModels.RefreshTokenRequestModel;
using HomeWork.Domain.ResponseModels.AuthResponseModel;
using HomeWork.Domain.Models;
using HomeWork.Domain.Share.Errors;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;


using System.Text;

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
            _context = context;
            _config = config;
            _tokenService = tokenService;
        }
        public async Task<LoginResponseModel> LoginAsync(LoginRequestModel request)
        {
            // ย้าย Logic การคิดคำนวณต่างๆ มาไว้ที่นี่ 
            // (ในอนาคตเราจะเอา Repository มาเช็คกับ Database ตรงนี้ครับ)
            string hashPassword = ComputeSHA512(request.Password);

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Username == request.Username && x.PasswordHash == hashPassword);
            if (user != null)
            {
                var jwtModel = new JwtTokenModel
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    RoleCode = user.RoleCode 
                };
                await SetJWTTokenService(jwtModel);
                return new LoginResponseModel
                {
                    Message = "Login Success",
                };
            }
            error.AddError("หรัสผิดเดอร์");
          
            error.ThrowIfError();
            return null;
        }

        public async Task<LoginResponseModel> RefreshTokenAsync(TokenRequestModel request)
        {
            var oldTokens = _tokenService.GetCurrentToken();
            if (string.IsNullOrEmpty(oldTokens.RefreshToken) || string.IsNullOrEmpty(oldTokens.AccessToken))
            {
                return null; // ไม่มี Token ใน Cookie ให้กลับไปหน้า Login
            };
            var saveToken = await _context.Tokens.FirstOrDefaultAsync(t =>
                t.RefreshToken == oldTokens.RefreshToken &&
                t.AccessToken == oldTokens.AccessToken
            );

            if (saveToken == null)
            {
                return null; // ไม่มี Token ใน Database ให้กลับไปหน้า Login
            };

            if (saveToken.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                _context.Tokens.Remove(saveToken);
                await _context.SaveChangesAsync();
                return null;
            };

            var user = await _context.Users.FindAsync(saveToken.UserId);
            if (user == null) return null;

            var jwtModel = new JwtTokenModel
            {
                UserId = user.UserId,
                Username = user.Username,
                RoleCode = user.RoleCode
            };

           
            await SetJWTTokenService(jwtModel);

            return new LoginResponseModel
            {
                Message = "Token Refreshed Successfully"
            };
        }

            private async Task SetJWTTokenService(JwtTokenModel user)
        {
            // ให้ Shared Service ออกบัตรให้
            string accessToken = _tokenService.GenerateToken(user);
            string refreshToken;
            //string refreshToken = _tokenService.GenerateRefreshToken();

           

            // ค้นหาว่า User คนนี้มี Token เก่าใน DB ไหม
            var dbToken = await _context.Tokens.FirstOrDefaultAsync(x => x.UserId == user.UserId);

            if (dbToken == null)
            {
                refreshToken = _tokenService.GenerateRefreshToken();
                dbToken = new Token
                {
                    UserId = user.UserId,
                    CreatedBy = user.UserId,
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(10)
                };
                _context.Tokens.Add(dbToken);
            }
            else
            {
                refreshToken = dbToken.RefreshToken;
                dbToken.AccessToken = accessToken;
            }

            //เอาบัตรไปใส่ตู้เซฟล่องหน(HttpOnly Cookie)
            _tokenService.SetHttpToken(new SetTokenRequest()
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            });

            // อัปเดตข้อมูล Token และตั้งเวลาหมดอายุ 10 นาที
            //dbToken.AccessToken = accessToken;
            //dbToken.RefreshToken = refreshToken;
            //dbToken.RefreshTokenExpiryTime = DateTime.UtcNow.AddMinutes(10);

            await _context.SaveChangesAsync();
        }

        
        
        public async Task<string> RegisterAsync(RegisterRequestModel request)
        {
            
            // 1. ตรวจสอบข้อมูล (Validation Rules)
            var isUserExist = await _context.Users.AnyAsync(u => u.Username == request.Username);
            if (string.IsNullOrWhiteSpace(request.Username))
            {
                error.AddErrorKeyAndToast("username", "กรุณากรอก username");
            }
            else if (request.Username.Length > 200)
            {
                error.AddErrorKeyAndToast("username", "ความยาวห้ามเกิน 200");
            }
            else if (ContainsEmoji(request.Username))
            {
                error.AddErrorKeyAndToast("username", "ห้ามใส่ emoji");
            }
            else if (isUserExist)
            {
                error.AddErrorKeyAndToast("username", "Username นี้มีผู้ใช้งานแล้ว");
            }
            // เช็ค Password ตรงกันไหม
            if (request.Password != request.ConfirmPassword)
            {
                error.AddError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
            }
            // เช็คเบอร์โทรศัพท์ (ไม่เกิน 10 ตัวอักษร และต้องเป็นตัวเลขล้วน)
            if (request.Phone?.Length > 10 || !request.Phone.All(char.IsDigit))
            {
                error.AddErrorKeyAndToast("phone", "เบอร์โทรศัพท์ต้องเป็นตัวเลข และความยาวไม่เกิน 10 หลัก");
            }
            // เช็คอายุ (ต้องอยู่ระหว่าง 1 - 100 ปี)
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
            else if (ContainsEmoji(request.FirstName))
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
            else if (ContainsEmoji(request.LastName))
            {
                error.AddErrorKeyAndToast("lastname", "ห้ามใส่ emoji");
            }
            else if (request.LastName.Length > 200)
            {
                error.AddErrorKeyAndToast("lastname", "ความยาวห้ามเกิน 200");
            }
            if (isUserExist)
            {
                error.AddErrorKeyAndToast("username", "Username นี้มีผู้ใช้งานแล้ว");
            }
            // ถ้ามี Error แม้แต่ข้อเดียว ให้ปาระเบิดออกไปเลย (Middleware จะจับให้เอง)
            error.ThrowIfError();

            // ----------------------------------------------------
            // 3. บันทึกลง Database
            // ----------------------------------------------------
            DateOnly? birthDateOnly = null;
            if (DateTime.TryParse(request.BirthDate, out DateTime parsedBirthDate))
            {
                birthDateOnly = DateOnly.FromDateTime(parsedBirthDate);
            }

            var newUser = new User
            {
                Username = request.Username,
                PasswordHash = ComputeSHA512(request.Password), // เข้ารหัสผ่านก่อนลง DB เสมอ
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                BirthDate = birthDateOnly,
                RoleCode = "member", // กำหนดสิทธิ์เริ่มต้นเป็น member ธรรมดา
                CreatedAt = DateTime.UtcNow
                // หากใน DB คุณมี Field อื่นๆ เช่น Age ก็สามารถ Mapping เพิ่มได้ครับ
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return "สมัครสมาชิกสำเร็จ!";
        }
        public static string ComputeSHA512(string s)
        {
            StringBuilder sb = new StringBuilder();
            using (SHA512 sha512 = SHA512.Create())
            {
                byte[] hashValue = sha512.ComputeHash(Encoding.UTF8.GetBytes(s));
                foreach (byte b in hashValue)
                {
                    sb.Append($"{b:X2}");
                }
            }

            return sb.ToString();
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = true,
                ValidateIssuer = true,
                ValidIssuer = _config["Jwt:Issuer"],
                ValidAudience = _config["Jwt:Audience"],
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"])),
                ValidateLifetime = false //  ปิดการเช็คเวลาชั่วคราว เพื่อให้แงะข้อมูลได้แม้จะหมดอายุแล้ว
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

            // เช็คความถูกต้องของอัลกอริทึม
            if (!(securityToken is JwtSecurityToken jwtSecurityToken) ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Invalid token");
            }

            return principal;
        }
        private bool ContainsEmoji(string text)
        {
            if (string.IsNullOrEmpty(text)) return false;
            // เช็คว่ามีอักขระที่เป็น Surrogate (Emoji) ปะปนมาหรือไม่
            return text.Any(char.IsSurrogate);
        }

    }
}
