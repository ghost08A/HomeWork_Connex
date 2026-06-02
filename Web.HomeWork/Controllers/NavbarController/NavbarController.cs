using HomeWork.Domain.Interfaces.Services.NavbarService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Web.HomeWork.Controllers.NavbarController
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // บังคับต้องแนบ Token
    public class NavbarController : ControllerBase
    {
        private readonly INavbarService _navbarService;

        public NavbarController(INavbarService navbarService)
        {
            _navbarService = navbarService;
        }

        [HttpGet("my-menus")]
        public async Task<IActionResult> GetMyMenus()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userRole))
            {
                return Unauthorized(new { message = "ไม่พบสิทธิ์การใช้งานในระบบ" });
            }

            // 🌟 2. ส่ง RoleCode ไปให้ Service ค้นหาเมนู
            var menus = await _navbarService.GetMenusByRoleAsync(userRole);

            // 🌟 3. ส่ง JSON List กลับไปให้หน้าบ้าน
            return Ok(menus);
        }

    }
}
