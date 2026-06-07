using HomeWork.Domain.Interfaces.Services.NavbarService;
using HomeWork.Domain.Interfaces.Services.NavbarService;
using HomeWork.Domain.Interfaces.Services.TokenService;
using HomeWork.Domain.Models;
using HomeWork.Domain.ResponseModels.NavbarResponseModel;
using HomeWork.Domain.Share.Errors;
using Microsoft.EntityFrameworkCore;

namespace HomeWork.Service.ImplementServices.NavbarService
{
    public class NavbarService : INavbarService
    {
        CustomError error = new CustomError();
        private readonly connexContext _context;
        private readonly ITokenService _TokenService; // เรียกใช้งาน TokenService

        public NavbarService(connexContext context, ITokenService TokenService)
        {
            _context = context;
            _TokenService = TokenService; // รับค่า TokenService ผ่าน Constructor
        }

        public async Task<List<NavbarResponseModel>> GetMenusByRoleAsync()
        {
            var currentUser = _TokenService.GetCurrentUser();

            // ถ้าไม่มีผู้ใช้หรือไม่มีสิทธิ์ ให้เริ่มต้นด้วย List ว่าง เพื่อดึงเฉพาะเมนู public
            var userRoles = currentUser?.Roles ?? new List<string>();

            // 2. สร้าง List ของ Role ที่จะใช้ในการ Query โดยเพิ่ม "public" เข้าไปด้วยเสมอ
            var rolesToQuery = new List<string>(userRoles);
            if (!rolesToQuery.Contains("public"))
            {
                rolesToQuery.Add("public");
            }

            // 3. สร้าง Query ที่มีประสิทธิภาพโดยใช้ .Contains()
            // EF Core จะแปลงเป็น "WHERE RoleCode IN ('admin', 'member', 'public')" ให้เอง
            var query = from nav in _context.Navbars
                        join role in _context.MapRolePages on nav.PageCode equals role.PageCode
                        join page in _context.RefPages on nav.PageCode equals page.PageCode
                        where rolesToQuery.Contains(role.RoleCode)
                        orderby nav.Seq
                        select new NavbarResponseModel
                        {
                            NavbarName = nav.NavbarName,
                            PageURL = page.PageUrl,
                            Seq = nav.Seq
                        };

            // 4. ดึงข้อมูลและใช้ Distinct() เพื่อตัดรายการเมนูที่ซ้ำซ้อนออก
            return await query.Distinct().ToListAsync();
        }
    }
}
