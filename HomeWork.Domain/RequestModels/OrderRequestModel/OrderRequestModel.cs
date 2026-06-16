using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.RequestModels.OrderRequestModel
{
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
