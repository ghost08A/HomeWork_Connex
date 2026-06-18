using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.ResponseModels.OrderResponseModel
{
    public class OrderProductResponseModel
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string Status { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderSearchResponseModel
    {
        public string OrderId { get; set; }
        public string ActionBy { get; set; }
        public string StatusOrder { get; set; }
        public DateTime OrderDate { get; set; }
        public List<OrderProductResponseModel> Products { get; set; }
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
}
