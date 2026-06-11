using HomeWork.Domain.RequestModels.ProductRequestModel;
using HomeWork.Domain.ResponseModels.PageResultResponseModel;
using HomeWork.Domain.ResponseModels.ProductResponseModel;
using HomeWork.Domain.Share.Errors;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.Interfaces.Services.ProductService
{
    public interface IProductService
    {
        Task<PageResultResponseModel<ProductSearchResponseModel>> SearchProductsAsync(ProductSearchRequestModel request, CustomError error);
    }
}
