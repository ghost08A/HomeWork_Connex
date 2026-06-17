using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.ResponseModels.ProductResponseModel
{
    public class ProductDetailResponseModel
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public string ImagePath { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public List<string> CategoryNames { get; set; }


    }
    public class ProductSearchResponseModel
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public decimal Price { get; set; }
        public string Detail { get; set; }
        public int Quantity { get; set; }
        public string ImagePath { get; set; }
        public string StatusProductCode { get; set; }
        public List<int> CategoryId { get; set; } = new List<int>();
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
