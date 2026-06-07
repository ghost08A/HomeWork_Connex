using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.RequestModels.RefreshTokenRequestModel
{
    public class TokenRequestModel
    {
        public string AccessToken { get; set; }
    }

    public class JwtTokenModel
    {
        public int UserId { get; set; }
        public string Username { get; set; }
        public List<string> Roles { get; set; }
    }

    public class SetTokenRequest
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
    }

    public class AccessTokenViewModel
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
    }
}
