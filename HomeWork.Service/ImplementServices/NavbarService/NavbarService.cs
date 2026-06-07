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
            var currentUser = _TokenService.GetCurrentUser(); // ดึงข้อมูลผู้ใช้ปัจจุบันจาก TokenService
            if(currentUser == null || string.IsNullOrEmpty(currentUser.RoleCode))
            {
                error.AddError("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้งาน");
                error.ThrowIfError();
            }

            string roleCode = currentUser.RoleCode;

            var query = from nav in _context.Navbars
                        join role in _context.MapRolePages on nav.PageCode equals role.PageCode

                        join page in _context.RefPages on nav.PageCode equals page.PageCode

                        where role.RoleCode == roleCode
                        orderby nav.Seq

                        select new NavbarResponseModel
                        {
                            NavbarName = nav.NavbarName,
                            PageURL = page.PageUrl,
                            Seq = nav.Seq
                        };
            return await query.ToListAsync();
        }
    }
}
