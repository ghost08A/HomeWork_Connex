using HomeWork.Domain.Interfaces.Services.AuthService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc; 

namespace Web.HomeWork.Controllers.Authentication
{
    [Authorize]  // ต้องล็อกอินเท่านั้นถึงเรียกได้
    [Route("api/Auth")]
    [ApiController]
    public class AuthSecureController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthSecureController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            // เรียกใช้เมธอดจาก Service
            var result = await _authService.RefreshTokenAsync();

            // ส่งผลลัพธ์กลับไป
            if (result != null)
            {
                return Ok(result);
            }
            return Unauthorized("Invalid refresh token");
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync();
            return Ok(new { message = "ออกจากระบบสำเร็จ" });
        }

        [HttpGet("GetProfile")]
        public async Task<IActionResult> GetProfile()
        {
            var profile = await _authService.GetCurrentUserProfileAsync();
            if (profile == null)
                return Unauthorized(new { message = "กรุณาเข้าสู่ระบบใหม่" });

            return Ok(profile);
        }

        [HttpPost("ReVokeAllTokens")]
        public async Task<IActionResult> ReVokeAllTokens(int userId)
        {
            var result = await _authService.RevokeAllTokensAsync(userId);
            if (result)
                return Ok(new { message = "ยกเลิกโทเค็นทั้งหมดสำเร็จ" });
            return BadRequest(new { message = "ไม่สามารถยกเลิกโทเค็นได้" });
        }

    }
}
