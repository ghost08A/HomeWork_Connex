using HomeWork.Domain.RequestModels.RefreshTokenRequestModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.Interfaces.Services.TokenService
{
    public interface  ITokenService
    {
        public string GenerateToken(JwtTokenModel userData);
        public string GenerateRefreshToken();
        public JwtTokenModel GetCurrentUser();
        public void SetHttpToken(SetTokenRequest param);
        public void RemoveHttpToken();
        public AccessTokenViewModel GetCurrentToken();
    }
}
