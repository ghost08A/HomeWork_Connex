using HomeWork.Domain.Interfaces.Services.AuthService;
using HomeWork.Domain.RequestModels.AuthRequestModel;
using HomeWork.Domain.RequestModels.RefreshTokenRequestModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Web.HomeWork.Controllers.Authentication
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost]
        [Route("login")]
           public async Task<IActionResult> Login([FromBody] LoginRequestModel request)
        {
            var result = await _authService.LoginAsync(request);
            if(result != null)
            {
                return Ok(result);
            }
            return Unauthorized(new { Message = "รหัสผิดเดอร์" });
        }

        [HttpPost]
        [Route("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] TokenRequestModel request)
        {
            // เรียกใช้เมธอดจาก Service
            var result = await _authService.RefreshTokenAsync(request);

            // ส่งผลลัพธ์กลับไป
            if (result != null)
            {
                return Ok(result);
            }
            return Unauthorized("Invalid refresh token");
        }

        [HttpPost]
        [Route("logout")]
        public async Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync();
            return Ok(new { message = "ออกจากระบบสำเร็จ" });
        }

        [Authorize] // ต้องล็อกอินเท่านั้นถึงเรียกได้
        [HttpGet]
        [Route("GetProfile")]
        public async Task<IActionResult> GetProfile()
        {
            var profile = await _authService.GetCurrentUserProfileAsync();
            if (profile == null)
                return Unauthorized(new { message = "กรุณาเข้าสู่ระบบใหม่" });

            return Ok(profile);
        }



        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestModel request)
        {
            var resultMessage = await _authService.RegisterAsync(request);

            return Ok(new { message = resultMessage });
        }

    }
}
