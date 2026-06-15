using Dapper;
using HomeWork.Domain.Interfaces.Services.RawSqlServices;
using HomeWork.Domain.Models;
using HomeWork.Domain.RequestModels.ProductRequestModel;
using HomeWork.Domain.ResponseModels.NavbarResponseModel;
using HomeWork.Domain.ResponseModels.PageResultResponseModel;
using HomeWork.Domain.ResponseModels.ProductResponseModel;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace HomeWork.Service.ImplementServices.RawSqlServices
{
    public class RawSqlService : IRawSqlService
    {
        private readonly connexContext _context;

        public RawSqlService(connexContext context )
        {
            _context = context;
        }

        public async Task<List<NavbarResponseModel>> GetNavbarByRolesAsync(List<string> userRoles)
        {
            if (userRoles == null || !userRoles.Any())
            {
                return new List<NavbarResponseModel>();
            }

            string sql = @"
            SELECT DISTINCT
                n.""NavbarName"",
                p.""PageURL"" AS ""PageURL"",
                n.""Seq"",
                n.""PageCode""
            FROM ""Navbar"" n
            INNER JOIN ""MapRolePage"" r ON n.""PageCode"" = r.""PageCode""
            INNER JOIN ""RefPage"" p ON n.""PageCode"" = p.""PageCode""
            WHERE r.""RoleCode"" = ANY(@Roles)
            ORDER BY n.""Seq""
        ";

            using var connection = _context.Database.GetDbConnection();

            var menus = await connection.QueryAsync<NavbarResponseModel>(sql, new { Roles = userRoles });// Dapper จะแปลง List เป็น Array ให้ PostgreSQL อัตโนมัติผ่าน ANY()


            return menus.ToList();
        }

    }
}
