using Dapper;
using GitHub.Copilot.SDK.Rpc;
using HomeWork.Domain.Interfaces.Services.ProductService;
using HomeWork.Domain.Interfaces.Services.RawSqlServices;
using HomeWork.Domain.Interfaces.Services.TokenService;
using HomeWork.Domain.Models;
using HomeWork.Domain.RequestModels.ProductRequestModel;
using HomeWork.Domain.ResponseModels.PageResultResponseModel;
using HomeWork.Domain.ResponseModels.ProductResponseModel;
using HomeWork.Domain.ResponseModels.ValueOptionResponseModel;
using HomeWork.Domain.Share.Errors;
using HomeWork.Service.Helper;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;


namespace HomeWork.Service.ImplementServices.ProductService
{

    public class ProductService: IProductService
    {
        private readonly connexContext _context;
        private readonly ITokenService _tokenService;
        public ProductService(connexContext context,ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<object> SearchProductsAsync(ProductSearchRequestModel request, CustomError error)
        {
            var query = _context.Products
                .Include(p => p.ProductCategories)
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                query = query.Where(p => p.ProductName.Contains(request.Keyword));
            }

            bool bothUnchecked = !request.FilterActive && !request.FilterInactive;
            if (!bothUnchecked)
            {
                var activeStatuses = new List<string>();
                if (request.FilterActive) activeStatuses.Add("ACTIVE");
                if (request.FilterInactive) activeStatuses.Add("INACTIVE");
                
                query = query.Where(p => activeStatuses.Contains(p.StatusProductCode));
            }

            if (request.CategoryIds != null && request.CategoryIds.Any())
            {
                query = query.Where(p => p.ProductCategories.Any(pc => request.CategoryIds.Contains(pc.CategoryId)));
            }

            var selectQuery = query.Select(p => new ProductSearchResponseModel
            {
                ProductId = p.ProductId,
                ProductName = p.ProductName,
                Price = p.Price,
                Detail = p.Detail,
                Quantity = p.Quantity - p.OrderDetails
                            .Where(od => od.Order.StatusOrderCode == "APPROVED" && od.StatusOrderDetailCode == "APPROVED" || od.StatusOrderDetailCode == "RETURNED"|| od.StatusOrderDetailCode == "PARTIALRETURN")
                            .Sum(od => od.Quantity - od.ReturnedQuantity),
                ImagePath = p.ImagePath,
                StatusProductCode = p.StatusProductCode,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                CategoryId = p.ProductCategories.Select(pc => pc.CategoryId).ToList()
            });

            return await DevExtreme.AspNet.Data.DataSourceLoader.LoadAsync(selectQuery, request.LoadOptions);
        }

        public async Task<List<ValueOptionResponseModel<int>>> GetProducts(bool onlyAvailable = false)
        {
            var query = _context.Products.AsNoTracking().AsQueryable();

            if (onlyAvailable)
            {
                query = query.Where(p =>
                    p.StatusProductCode == "ACTIVE" &&
                    (p.Quantity - _context.OrderDetails
                        .Where(od => od.ProductId == p.ProductId)
                        .Where(OrderDetailExtensions.IsCountedAgainstStock)
                        .Sum(od => od.Quantity - od.ReturnedQuantity) 
                        ) > 0
                );
            }
            var products = await query
               .Select(c => new ValueOptionResponseModel<int>
               {
                   Key = c.ProductId,
                   Value = c.ProductName
               })
               .ToListAsync();

            return products;
        }
        public async Task<List<ValueOptionResponseModel<int>>> GetGategories()
        {
            var categories = await _context.Categories 
                .AsNoTracking() 
                .Select(c => new ValueOptionResponseModel<int>
                {
                    Key = c.CategoryId,
                    Value = c.CategoryName
                })
                .ToListAsync();
            return categories;
        }

        public async Task<List<ValueOptionResponseModel<string>>> GetStatus()
        {
            var statuses = await _context.StatusProducts
                .AsNoTracking()
                .Select(s => new ValueOptionResponseModel<string>
                {
                    Key = s.StatusProductCode,
                    Value = s.StatusProductName
                })
                .ToListAsync();
            return statuses;
        }

        public async Task<ProductDetailResponseModel> GetProductDetailById(int productId, CustomError error)
        {
            var product = await _context.Products
                .AsNoTracking()
                .Where(p => p.ProductId == productId)
                .Select(p => new ProductDetailResponseModel {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    Description = p.Detail,
                    ImagePath = p.ImagePath,
                    Price = p.Price,
                    Quantity = p.Quantity - _context.OrderDetails
                        .Where(od => od.ProductId == p.ProductId)
                        .Where(OrderDetailExtensions.IsCountedAgainstStock)
                        .Sum(od => od.Quantity - od.ReturnedQuantity),
                    CategoryNames =p.ProductCategories
                        .Select(pc=> pc.Category.CategoryName).ToList()
                })
                .FirstOrDefaultAsync();
            if (product == null)
            {
                error.AddError("ไม่พบข้อมูลสินค้ารหัสนี้");
                error.ThrowIfError();
            }

            return product;
        }


        public async Task<string> CreateProductAsync(CreateProductRequestModel request, CustomError error)
        {
            var user = _tokenService.GetCurrentUser();
            DateTime timeNow = DateTime.UtcNow;
            ValidateProduct(request, error);

            error.ThrowIfError();

            var newProduct = new Product
            {
                ProductName = request.ProductName,
                Price = request.Price,
                Detail = request.Detail,
                Quantity = request.Quantity,
                ImagePath = request.ImagePath ?? string.Empty,
                StatusProductCode = request.StatusProductCode,
                CreatedAt = timeNow,
                CreatedBy = user.UserId
            };

            var productCategories = request.CategoryId.Select(id => new ProductCategory
            {
                CategoryId = id
            }).ToList();

            newProduct.ProductCategories = productCategories;

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _context.Products.Add(newProduct);
                await _context.SaveChangesAsync();
                var logNewProduct = new LogProduct
                {
                    ProductId = newProduct.ProductId,
                    Action = "CREATE",
                    ProductName = newProduct.ProductName,
                    Price = newProduct.Price,
                    Detail = newProduct.Detail,
                    Quantity = newProduct.Quantity,
                    ImagePath = newProduct.ImagePath,
                    StatusProductCode = newProduct.StatusProductCode,
                    CreatedAt = timeNow,
                    CreatedBy = user.UserId
                };
                _context.LogProducts.Add(logNewProduct);
                await _context.SaveChangesAsync();

                // "ยืนยัน" การเซฟข้อมูลทั้งหมด
                await transaction.CommitAsync();

                return "success";
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                throw;
            }
        }

        public async Task<string> UpdateProductAsync(UpdateProductRequestModel request, CustomError error)
        {
            var user = _tokenService.GetCurrentUser();
            DateTime timenow = DateTime.UtcNow;
            var product = await _context.Products
                .Include(p => p.ProductCategories)
                .FirstOrDefaultAsync(p => p.ProductId == request.ProductId);

            ValidateProduct(request, error);
            if (product==null) error.AddError("ไม่พบข้อมูลสินค้า");

            
            if (request.updateAt.HasValue && request.updateAt < product.UpdatedAt)
                error.AddError("เวอร์ชั่นไม่ตรงกันกรุณาลองใหม่อีกครั้ง");

            await ValidateDatabaseMasterDataAsync(request.ProductName,request.CategoryId, request.StatusProductCode, error);
            error.ThrowIfError();

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                product.ProductName = request.ProductName;
                product.Price = request.Price;
                product.Detail = request.Detail;
                product.Quantity = request.Quantity;
                product.ImagePath = request.ImagePath;
                product.StatusProductCode = request.StatusProductCode;

                product.UpdatedAt = timenow;
                product.UpdatedBy = user.UserId;

                _context.ProductCategories.RemoveRange(product.ProductCategories);
                product.ProductCategories = request.CategoryId.Select(id => new ProductCategory {
                    ProductId = product.ProductId,
                    CategoryId = id,
                }).ToList();

                var logUpdateProduct = new LogProduct
                {
                    ProductId = product.ProductId,
                    Action = "UPDATE",
                    ProductName = product.ProductName,
                    Price = product.Price,
                    Detail = product.Detail,
                    Quantity = product.Quantity,
                    ImagePath = product.ImagePath,
                    StatusProductCode = product.StatusProductCode,
                    CreatedAt = product.CreatedAt, // เก็บเวลาสร้างเดิม
                    CreatedBy = product.CreatedBy,
                    UpdatedAt = timenow, // เวลาที่อัปเดต
                    UpdatedBy = user.UserId
                };

                _context.LogProducts.Add(logUpdateProduct);

                // 4.4 เซฟลง Database
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return "success";
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                error.AddError("เกิดข้อผิดพลาด");
                error.ThrowIfError();
                throw;
            }
        }

        public async Task<string> UpsertProductAsync(UpsertProductRequestModel request, CustomError error)
        {
            var user = _tokenService.GetCurrentUser();
            var timeNow = DateTime.UtcNow;
            ValidateProduct(request, error);

            await ValidateDatabaseMasterDataAsync(request.ProductName,request.CategoryId, request.StatusProductCode, error);
            error.ThrowIfError();

            Product product;
            var bookedQuantity = 0;
            bool isCreate = !request.ProductId.HasValue || request.ProductId == 0;
            if (isCreate)
            {
                product = new Product
                {
                    CreatedAt = timeNow,
                    CreatedBy = user.UserId
                };
                _context.Products.Add(product);
            }
            else
            {
               
                product = await _context.Products
                    .Include(p => p.ProductCategories)
                    .FirstOrDefaultAsync(p => p.ProductId == request.ProductId);

                if (product == null) error.AddError("productId", "ไม่พบข้อมูลสินค้า");
                if (request.updateAt.HasValue && request.updateAt < product.UpdatedAt)
                    error.AddError("เวอร์ชั่นไม่ตรงกันกรุณาลองใหม่อีกครั้ง");
                    bookedQuantity = await _context.OrderDetails
                       .Where(od => od.ProductId == product.ProductId)
                       .WhereCountedAgainstStock()
                       .SumAsync(od => od.Quantity - od.ReturnedQuantity);

            }

            error.ThrowIfError();
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                product.ProductName = request.ProductName;
                product.Price = request.Price; 
                product.Detail = request.Detail; 
                product.Quantity = request.Quantity+bookedQuantity; 
                product.ImagePath = request.ImagePath; 
                product.StatusProductCode = request.StatusProductCode;

                if (!isCreate)
                {
                    product.UpdatedAt = timeNow; 
                    product.UpdatedBy = user.UserId; 
                    _context.ProductCategories.RemoveRange(product.ProductCategories);
                }

                product.ProductCategories = request.CategoryId.Select(id => new ProductCategory
                {
                    ProductId = product.ProductId,
                    CategoryId = id,
                }).ToList();

                await _context.SaveChangesAsync();
                var log = new LogProduct 
                { ProductId = product.ProductId, 
                    Action = isCreate ? "CREATE" : "UPDATE",
                    ProductName = product.ProductName, 
                    Price = product.Price,
                    Detail = product.Detail, 
                    Quantity = product.Quantity, 
                    ImagePath = product.ImagePath, 
                    StatusProductCode = product.StatusProductCode, 
                    CreatedAt = product.CreatedAt,
                    CreatedBy = product.CreatedBy, 
                    UpdatedAt = isCreate ? null : timeNow,
                    UpdatedBy = isCreate ? null : user.UserId 
                };
                _context.LogProducts.Add(log); 
                await _context.SaveChangesAsync();
                await transaction.CommitAsync(); 
                return isCreate ? "Create Success" : "Update Success";
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task ValidateDatabaseMasterDataAsync(string productName,List<int> categoryIds, string statusProductCode, CustomError error)
        {
            // 1. เช็คสถานะสินค้า (Status)
            // AnyAsync จะคืนค่า true ถ้าเจอข้อมูลอย่างน้อย 1 ตัว
            bool isStatusExist = await _context.StatusProducts
                .AnyAsync(s => s.StatusProductCode == statusProductCode);


            bool isProductNameExist = await _context.Products
                .AnyAsync(p => p.ProductName == productName);

            if (isProductNameExist)
                error.AddError("productName", "มีชื่อสินค้านี้แล้วลองใหม่อีกครั้ง");
                
            if (!isStatusExist)
            {
                error.AddError("statusProductCode", "ระบุสถานะสินค้าไม่ถูกต้อง หรือสถานะนี้ไม่มีอยู่ในระบบ");
            }

            if (categoryIds != null && categoryIds.Any())
            {
                var uniqueCategoryIds = categoryIds.Distinct().ToList();

                // ท่าไม้ตาย: นับจำนวนหมวดหมู่ใน DB ที่ตรงกับรหัสที่ส่งมา
                int existingCategoryCount = await _context.Categories
                    .CountAsync(c => uniqueCategoryIds.Contains(c.CategoryId));

                // ถ้าจำนวนที่เจอใน DB ไม่เท่ากับจำนวนที่หน้าบ้านส่งมา แปลว่ามีคนแอบส่งรหัสมั่วมาด้วย!
                if (existingCategoryCount != uniqueCategoryIds.Count)
                {
                    error.AddError("categoryId", "ระบุหมวดหมู่สินค้าไม่ถูกต้อง หรือหมวดหมู่ถูกลบออกจากระบบไปแล้ว");
                }
            }
        }
        private static void ValidateProduct(CreateProductRequestModel request, CustomError error)
        {
            if (string.IsNullOrWhiteSpace(request.ProductName))
            {
                error.AddError("productName", "กรุณาระบุชื่อสินค้า");
            }
            if (request.ProductName.Length > 255)
                error.AddError("productName", "ชื่อสินค้ายาวเกินไป (สูงสุด 255 ตัวอักษร)");
            if (CommonHelper.ContainsEmoji(request.ProductName))
                error.AddError("productName", "ห้ามใส่Emoji");
            // ดักราคา
            if (request.Price <= 0)
                error.AddError("price", "ราคาสินค้าต้องไม่ติดลบ");

            // ดักจำนวน
            if (request.Quantity < 0)
                error.AddError("quantity","จำนวนสินค้าต้องไม่ติดลบ");

            if (request.CategoryId == null || !request.CategoryId.Any())
                error.AddError("categoryId", "กรุณาเลือกอย่างน้อย 1 หมวดหมู่");

            if (request.CategoryId.Any(id => id <= 0))
                error.AddError("categoryId", "หมวดหมู่ไม่ถูกต้อง");

            if (string.IsNullOrWhiteSpace(request.ImagePath))
            {
                error.AddError("imagePath", "กรุณาระบุURL");
            }
            if (request.ImagePath.Length > 500)
                error.AddError("imagePath", "URLยาวเกินไป (สูงสุด 255 ตัวอักษร)");
            if (CommonHelper.ContainsEmoji(request.ImagePath))
                error.AddError("imagePath", "ห้ามใส่Emoji");

            if (string.IsNullOrWhiteSpace(request.Detail))
                error.AddError("detail", "กรุณาใส่รายละเอียดสินค้า");
            if (request.Detail.Length > 255)
                error.AddError("detail", "รายละเอียดสินค้ายาวเกินไป (สูงสุด 255 ตัวอักษร)");
            if (CommonHelper.ContainsEmoji(request.Detail))
                error.AddError("detail", "ห้ามใส่Emoji");
        }
    }
}
