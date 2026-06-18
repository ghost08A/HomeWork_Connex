using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.RequestModels.ProductRequestModel
{
    public class ProductSearchRequestModel
    {
        public DevExtreme.AspNet.Data.DataSourceLoadOptionsBase LoadOptions { get; set; } = new DevExtreme.AspNet.Data.DataSourceLoadOptionsBase();
        public string? Keyword { get; set; }
        public bool FilterActive { get; set; }
        public bool FilterInactive { get; set; }
        public List<int>? CategoryIds { get; set; }
    }

    public class OrderDetailItemResponseModel
    {
        public int? OrderDetailId { get; set; }
        public int Sequence { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public List<string> CategoryNames { get; set; } = new List<string>();
        public int Quantity { get; set; }
        public string? StatusOrderDetailCode { get; set; }
        public string? Remark { get; set; }

        public int ReturnedQuantity { get; set; }
        public DateTime? ReturnedAt { get; set; }
        public string? ReturnRemark { get; set; }
    }
    public class GetOrderByIdResponseModel
    {
        public string OrderId { get; set; }
        public string StatusOrders { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public List<OrderDetailItemResponseModel> OrderDetails { get; set; } = new List<OrderDetailItemResponseModel>();
    }

    public class CreateProductRequestModel
    {
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public string Detail { get; set; }
        public int Quantity { get; set; }
        public string ImagePath { get; set; }
        public string StatusProductCode { get; set; } = "ACTIVE";
        public List<int> CategoryId { get; set; }
    }

    public class UpdateProductRequestModel : CreateProductRequestModel
    {
        public int ProductId { get; set; }
        public DateTime? updateAt { get; set; }
    }

    public class UpsertProductRequestModel : CreateProductRequestModel
    {
        public int? ProductId { get; set; } // null = Create
        public DateTime? updateAt { get; set; }
    }
}
