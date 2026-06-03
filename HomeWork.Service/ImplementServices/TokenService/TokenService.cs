using HomeWork.Domain.Interfaces.Services.TokenService;
using HomeWork.Domain.RequestModels.RefreshTokenRequestModel;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using static System.Net.WebRequestMethods;

namespace HomeWork.Service.ImplementServices.TokenService
{
    public class TokenService : ITokenService
    {
        private readonly IHttpContextAccessor _http;
        private readonly IConfiguration _config;

        public TokenService(IHttpContextAccessor http, IConfiguration config)
        {
            _http = http;
            _config = config;
        }

        public string GenerateToken(JwtTokenModel userData)
        {
            DateTime expiresAt = DateTime.UtcNow.AddMinutes(2);
            SymmetricSecurityKey securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            SigningCredentials credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            List<Claim> claims = new List<Claim>
            {
                new Claim("userId", userData.UserId.ToString()),
                new Claim(ClaimTypes.Name, userData.Username ?? ""),
                new Claim(ClaimTypes.Role, userData.RoleCode)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: expiresAt,
                signingCredentials: credentials
                );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        public JwtTokenModel GetCurrentUser()
        {
            var user = _http.HttpContext?.User;
            if (user == null) throw new Exception("User not found in HttpContext");

            return new JwtTokenModel
            {
                UserId = int.Parse(
                    user.FindFirst("userId")?.Value ?? throw new Exception("userId claim not found")),
                Username = user.FindFirst(ClaimTypes.Name)?.Value ?? throw new Exception("Username claim not found"),
                RoleCode = user.FindFirst(ClaimTypes.Role)?.Value ?? throw new Exception("Role claim not found"),
            };
        }
        public void SetHttpToken(SetTokenRequest param)
        {
            var response = _http.HttpContext?.Response;
            if (response == null) throw new Exception("HttpContext Response is null");

            DateTime exprToken = DateTime.UtcNow.AddMinutes(2);
            var cookieOptions = new CookieOptions
            {
                Expires = exprToken,
                SameSite = SameSiteMode.None,
                HttpOnly = true, // ป้องกัน XSS Attack
                Secure = true,   // บังคับใช้ HTTPS
                Path = "/"
            };
            response.Cookies.Append("accessToken", param.AccessToken, cookieOptions);
            response.Cookies.Append("refreshToken", param.RefreshToken, cookieOptions);
        }

        public void RemoveHttpToken()
        {
            var response = _http.HttpContext?.Response;
            var cookieOptions = new CookieOptions
            {
                SameSite = SameSiteMode.None,
                HttpOnly = true,
                Secure = true,
                Path = "/"
            };

            response?.Cookies.Delete("accessToken", cookieOptions);
            response?.Cookies.Delete("refreshToken", cookieOptions);
        }

        public AccessTokenViewModel GetCurrentToken()
        {
            string accessToken = _http.HttpContext?.Request.Cookies["accessToken"] ?? throw new Exception("Access token not found in cookies");
            String refreshToken = _http.HttpContext?.Request.Cookies["refreshToken"] ?? throw new Exception("Refresh token not found in cookies");

            return new AccessTokenViewModel
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };

        }
    } 
}
