using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.RequestModels.AuthRequestModel
{
    public class LoginRequestModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class IsSessionValidRequestModel
    {
        public int userId { get; set; }
        public string accessToken { get; set; }
    }

    public class RegisterRequestModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public string Phone { get; set; }
        public string? BirthDate { get; set; }
        public string Age { get; set; }
    }
}
