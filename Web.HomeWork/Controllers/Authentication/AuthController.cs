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

        [HttpGet("test-error")]
        public IActionResult TestError()
        {
            // โยน Exception แบบดื้อๆ ออกมาเลย 
            // ตัว Middleware ที่คุณเขียนไว้จะดักจับสิ่งนี้แล้วเอาไปบันทึกลง Database ทันที
            throw new Exception("นี่คือ Error สำหรับทดสอบระบบบันทึก Log ลง Database ครับ!");
        }
        [HttpGet("test-divide-zero")]
        public IActionResult TestDivideByZero()
        {
            // กำหนดตัวเลขเพื่อจำลองการคำนวณ
            int number = 100;
            int divisor = 0;

            // 💣 โค้ดจะระเบิดและพ่น DivideByZeroException ออกมาที่บรรทัดนี้ทันที
            int result = number / divisor;

            return Ok(new { message = "ถ้าเห็นข้อความนี้ แสดงว่าโค้ดรันผ่าน (ซึ่งไม่ควรผ่าน!)", result });
        }

    }
}
