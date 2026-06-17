using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.RequestModels.OrderRequestModel
{
    public class OrderDetailRequestModel
    {
        public int? OrderDetailId { get; set; }
        public int ProductId { get; set; }
        public int Sequence { get; set; }
        public int Quantity { get; set; }

        public string StatusOrderDetailCode { get; set; }
        public string? Remark { get; set; }
        public int ReturnedQuantity { get; set; } = 0;
        public string? ReturnRemark { get; set; }
    }
    public class UpsertOrderRequestModel
    {
        public string? OrderId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string StatusOrders { get; set; }
        public List<OrderDetailRequestModel> OrderDetails { get; set; } = new();

    }
    public class SearchOrderRequestModel
    {
        public DevExtreme.AspNet.Data.DataSourceLoadOptionsBase LoadOptions { get; set; } = new DevExtreme.AspNet.Data.DataSourceLoadOptionsBase();
        public string? Keyword { get; set; }
        public List<string>? StatusOrder { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; } 
        public List<int>? ProductIds { get; set; }
    }
}
