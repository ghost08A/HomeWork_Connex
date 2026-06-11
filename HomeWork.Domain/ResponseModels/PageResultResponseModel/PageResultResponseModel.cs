using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.ResponseModels.PageResultResponseModel
{
    public class PageResultResponseModel<T>
    {
        public List<T> Item { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}
