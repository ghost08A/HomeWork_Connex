using HomeWork.Domain.RequestModels.ProductRequestModel;
using HomeWork.Domain.ResponseModels.PageResultResponseModel;
using HomeWork.Domain.ResponseModels.ProductResponseModel;
using HomeWork.Domain.ResponseModels.ValueOptionResponseModel;
using HomeWork.Domain.Share.Errors;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.Interfaces.Services.ProductService
{
    public interface IProductService
    {
        Task<List<ValueOptionResponseModel<int>>> GetGategories();

        Task<List<ValueOptionResponseModel<string>>> GetStatus();

        Task<PageResultResponseModel<ProductSearchResponseModel>> SearchProductsAsync(ProductSearchRequestModel request, CustomError error);

        Task<string> CreateProductAsync(CreateProductRequestModel request, CustomError error);
    }
}
