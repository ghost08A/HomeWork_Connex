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
}
