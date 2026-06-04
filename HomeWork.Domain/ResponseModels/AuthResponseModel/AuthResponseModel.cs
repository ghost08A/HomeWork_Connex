using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.ResponseModels.AuthResponseModel
{
    public class LoginResponseModel
    {
        public string Message { get; set; }

    }

    public class UserProfileResponseModel
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string RoleCode { get; set; }
    }
}
