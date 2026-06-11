using Dapper;
using HomeWork.Domain.Interfaces.Services.ProductService;
using HomeWork.Domain.Interfaces.Services.RawSqlServices;
using HomeWork.Domain.Interfaces.Services.TokenService;
using HomeWork.Domain.Models;
using HomeWork.Domain.RequestModels.ProductRequestModel;
using HomeWork.Domain.ResponseModels.PageResultResponseModel;
using HomeWork.Domain.ResponseModels.ProductResponseModel;
using HomeWork.Domain.Share.Errors;
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
        public ProductService(IRawSqlService rawSqlService)
        {
            _rawSqlService = rawSqlService;
        }

        public async Task<PageResultResponseModel<ProductSearchResponseModel>> SearchProductsAsync(ProductSearchRequestModel request, CustomError error)
        {
            var product = await _rawSqlService.SearchProductsAsync(request);

            return product;

        }

    }
}
