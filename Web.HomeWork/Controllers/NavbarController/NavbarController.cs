using HomeWork.Domain.Interfaces.Services.NavbarService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Web.HomeWork.Controllers.NavbarController
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // บังคับว่าต้องล็อกอินเท่านั้นถึงจะเรียก API ดึงเมนูได้
    public class NavbarController : ControllerBase
    {
        private readonly INavbarService _navbarService;

        public NavbarController(INavbarService navbarService)
        {
            _navbarService = navbarService;
        }

        [HttpGet("menus")]
        public async Task<IActionResult> GetMyMenus()
        {
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userRole))
            {
                return Unauthorized(new { message = "ไม่พบสิทธิ์การใช้งานในระบบ" });
            }

            // เรียกใช้บริการเพื่อดึงเมนูตามบทบาทของผู้ใช้
            var menus = await _navbarService.GetMenusByRoleAsync();

            //  ส่ง JSON List กลับไปให้หน้าบ้าน
            return Ok(menus);
        }

    }
}
