using HomeWork.Domain.Interfaces.Services.NavbarService;
using HomeWork.Domain.Models;
using HomeWork.Domain.ResponseModels.NavbarResponseModel;
using Microsoft.EntityFrameworkCore;
using HomeWork.Domain.Interfaces.Services.NavbarService;

namespace HomeWork.Service.ImplementServices.NavbarService
{
    public class NavbarService : INavbarService
    {
        private readonly connexContext _context;

        public NavbarService(connexContext context)
        {
            _context = context;
        }

        public async Task<List<NavbarResponseModel>> GetMenusByRoleAsync(string roleCode)
        {
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
