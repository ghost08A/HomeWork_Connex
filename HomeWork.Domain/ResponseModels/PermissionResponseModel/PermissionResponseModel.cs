using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.ResponseModels.PermissionResponseModel
{
   
        public class PrivPageResponseModel
        {
            public bool CanAccess { get; set; }
            public string? Permission { get; set; } // r หรือ rw
        }
}
