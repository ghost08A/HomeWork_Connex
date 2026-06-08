using HomeWork.Domain.Interfaces.Services.NavbarService;
using HomeWork.Domain.Interfaces.Services.RawSqlServices;
using HomeWork.Domain.Interfaces.Services.TokenService;
using HomeWork.Domain.Models;
using HomeWork.Domain.ResponseModels.NavbarResponseModel;
using Microsoft.EntityFrameworkCore;

namespace HomeWork.Service.ImplementServices.NavbarService
{
    public class NavbarService : INavbarService
    {
        private readonly IRawSqlService _rawSqlService;
        private readonly ITokenService _TokenService; // เรียกใช้งาน TokenService
        private readonly connexContext _context;


        public NavbarService(connexContext context,IRawSqlService rawSqlService, ITokenService TokenService)
        {
            _rawSqlService = rawSqlService;
            _TokenService = TokenService; // รับค่า TokenService ผ่าน Constructor
            _context = context;
        }

        public async Task<List<NavbarResponseModel>> GetNavBar()
        {
            var currentUser = _TokenService.GetCurrentUser();
            if (currentUser == null) return new List<NavbarResponseModel>();
            var userRoles = await _context.UserRoles
                .Where(user => user.UserId == currentUser.UserId)
                .Select(user => user.RoleCode)
                .ToListAsync();
            if(!userRoles.Any() ) return new List<NavbarResponseModel>();

            var menus = await _rawSqlService.GetNavbarByRolesAsync(currentUser.Roles);

            return menus;
        }

       
    }
}
