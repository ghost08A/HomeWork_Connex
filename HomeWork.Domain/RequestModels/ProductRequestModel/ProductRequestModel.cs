using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.RequestModels.ProductRequestModel
{
    public class ProductSearchRequestModel
    {
        public string? Keyword { get; set; }
        public bool FilterActive { get; set; }
        public bool FilterInactive { get; set; }
        public List<int>? CategoryIds { get; set; } 

        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
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
}
