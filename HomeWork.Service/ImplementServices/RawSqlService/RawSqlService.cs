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


        public async Task<PageResultResponseModel<ProductSearchResponseModel>> SearchProductsAsync(ProductSearchRequestModel request)
        {
            // 1. สร้างฐานของคำสั่ง SQL
            var sqlSelect = new StringBuilder(@"
                SELECT
                    p.""ProductId"", 
                    p.""ProductName"", 
                    p.""Price"", 
                    p.""Detail"", 
                    p.""Quantity"", 
                    p.""ImagePath"", 
                    p.""StatusProductCode"",
                    p.""CreatedAt"",
                    p.""UpdatedAt"",
                    COALESCE(
                        ARRAY_AGG(pc.""CategoryId"") FILTER (WHERE pc.""CategoryId"" IS NOT NULL),
                        ARRAY[]::int[]
                    ) AS ""CategoryId""
                FROM ""Product"" p
                LEFT JOIN ""ProductCategory"" pc ON pc.""ProductId"" = p.""ProductId""
                WHERE 1=1
            ");

            var sqlCount = new StringBuilder(@"
                SELECT COUNT(DISTINCT p.""ProductId"")
                FROM ""Product"" p
                LEFT JOIN ""ProductCategory"" pc ON pc.""ProductId"" = p.""ProductId""
                WHERE 1=1
            ");

            // ตัวแปรสำหรับเก็บค่าพารามิเตอร์ส่งให้ Dapper
            var parameters = new DynamicParameters();

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                var keywordFilter = @" AND p.""ProductName"" ILIKE @Keyword";
                sqlSelect.Append(keywordFilter);
                sqlCount.Append(keywordFilter);
                parameters.Add("Keyword", $"%{request.Keyword}%");
            }

            if (request.CategoryIds != null && request.CategoryIds.Any())
            {
                var categoryFilter = @" 
                    AND EXISTS (
                        SELECT 1 FROM ""ProductCategory"" pc2 
                        WHERE pc2.""ProductId"" = p.""ProductId"" 
                        AND pc2.""CategoryId"" = ANY(@CategoryIds)
                    )";

                sqlSelect.Append(categoryFilter);
                sqlCount.Append(categoryFilter);
                parameters.Add("CategoryIds", request.CategoryIds.ToArray());
            }

            bool bothUnchecked = !request.FilterActive && !request.FilterInactive;
            if (!bothUnchecked)
            {
                var activeStatuses = new List<string>();
                if (request.FilterActive) activeStatuses.Add("ACTIVE");
                if (request.FilterInactive) activeStatuses.Add("INACTIVE");

                var statusFilter = @" AND p.""StatusProductCode"" = ANY(@Statuses) ";
                sqlSelect.Append(statusFilter);
                sqlCount.Append(statusFilter);
                parameters.Add("Statuses", activeStatuses.ToArray());
            }

            // GROUP BY เพื่อรองรับ ARRAY_AGG
            sqlSelect.Append(@"
                GROUP BY p.""ProductId"", p.""ProductName"", p.""Price"", p.""Detail"",
                         p.""Quantity"", p.""ImagePath"", p.""StatusProductCode"", p.""CreatedAt"", p.""UpdatedAt""
            ");

            // ORDER BY + Pagination
            sqlSelect.Append(@" ORDER BY p.""ProductId"" ASC LIMIT @Limit OFFSET @Offset ");
            parameters.Add("Limit", request.PageSize);
            parameters.Add("Offset", (request.PageNumber - 1) * request.PageSize);

            using var connection = _context.Database.GetDbConnection();

            var totalCount = await connection.ExecuteScalarAsync<int>(sqlCount.ToString(), parameters);

            // ใช้ dynamic เพื่อ Map ค่า int[] ของ PostgreSQL ให้เข้า List<int>
            var rawItems = await connection.QueryAsync(sqlSelect.ToString(), parameters);
            var items = rawItems.Select(row => new ProductSearchResponseModel
            {
                ProductId        = (int)row.ProductId,
                ProductName      = (string)row.ProductName,
                Price            = (decimal)row.Price,
                Detail           = (string)row.Detail,
                Quantity         = (int)row.Quantity,
                ImagePath        = (string)row.ImagePath,
                StatusProductCode = (string)row.StatusProductCode,
                CreatedAt        = (DateTime)row.CreatedAt,
                UpdatedAt        = row.UpdatedAt == null ? (DateTime?)null : (DateTime)row.UpdatedAt,
                CategoryId       = ((int[])row.CategoryId).ToList()
            }).ToList();

            return new PageResultResponseModel<ProductSearchResponseModel>
            {
                Item       = items,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize   = request.PageSize
            };
        }
    }
}
