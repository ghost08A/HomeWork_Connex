using HomeWork.Domain.Interfaces.Services.AuthService;
using HomeWork.Domain.RequestModels.AuthRequestModel;
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

        [HttpPost("login")]
           public async Task<IActionResult> Login(LoginRequestModel request)
        {
            var result = await _authService.LoginAsync(request);
            if(result != null)
            {
                return Ok(result);
            }
            return Unauthorized(new { Message = "รหัสผิดเดอร์" });
        }

        

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequestModel request)
        {
            var resultMessage = await _authService.RegisterAsync(request);

            return Ok(new { message = resultMessage });
        }

    }
}
