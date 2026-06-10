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
