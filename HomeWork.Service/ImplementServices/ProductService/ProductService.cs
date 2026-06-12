using Dapper;
using HomeWork.Domain.Interfaces.Services.ProductService;
using HomeWork.Domain.Interfaces.Services.RawSqlServices;
using HomeWork.Domain.Interfaces.Services.TokenService;
using HomeWork.Domain.Models;
using HomeWork.Domain.RequestModels.ProductRequestModel;
using HomeWork.Domain.ResponseModels.PageResultResponseModel;
using HomeWork.Domain.ResponseModels.ProductResponseModel;
using HomeWork.Domain.ResponseModels.ValueOptionResponseModel;
using HomeWork.Domain.Share.Errors;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Service.ImplementServices.ProductService
{

    public class ProductService: IProductService
    {
        private readonly IRawSqlService _rawSqlService;
        private readonly connexContext _context;
        private readonly ITokenService _tokenService;
        public ProductService(connexContext context,IRawSqlService rawSqlService,ITokenService tokenService)
        {
            _rawSqlService = rawSqlService;
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<PageResultResponseModel<ProductSearchResponseModel>> SearchProductsAsync(ProductSearchRequestModel request, CustomError error)
        {
            if(request.PageSize<10 || request.PageSize >= 100)
            {
                error.AddError("PageSize ควรอยู่ในช่วง 10-100");
            }

            
            var product = await _rawSqlService.SearchProductsAsync(request);

            return product;

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

        private static void ValidateProduct(CreateProductRequestModel request, CustomError error)
        {
            if (string.IsNullOrWhiteSpace(request.ProductName))
            {
                error.AddError("productName", "กรุณาระบุชื่อสินค้า");
            }
            if (request.ProductName.Length > 255)
                error.AddError("ชื่อสินค้ายาวเกินไป (สูงสุด 255 ตัวอักษร)");

            // ดักราคา
            if (request.Price < 0)
                error.AddError("ราคาสินค้าต้องไม่ติดลบ");

            // ดักจำนวน
            if (request.Quantity < 0)
                error.AddError("จำนวนสินค้าต้องไม่ติดลบ");

            // ดักหมวดหมู่ (ต้องมีข้อมูลและห้ามมีรหัสติดลบ)
            if (request.CategoryId == null || !request.CategoryId.Any())
                error.AddError("กรุณาเลือกอย่างน้อย 1 หมวดหมู่");

            if (request.CategoryId.Any(id => id <= 0))
                error.AddError("หมวดหมู่ไม่ถูกต้อง");
        }
    }
}
