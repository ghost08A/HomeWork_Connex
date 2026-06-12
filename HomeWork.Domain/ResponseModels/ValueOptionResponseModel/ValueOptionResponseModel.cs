using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.ResponseModels.ValueOptionResponseModel
{
    public class ValueOptionResponseModel<T>
    {
        public T Key { get; set; } 
        public string Value { get; set; } 
    }
}
