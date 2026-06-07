using HomeWork.Domain.RequestModels.AuthRequestModel;
using HomeWork.Domain.RequestModels.RefreshTokenRequestModel;
using HomeWork.Domain.ResponseModels.AuthResponseModel;

namespace HomeWork.Domain.Interfaces.Services.AuthService
{
    public interface IAuthService
    {
        Task<LoginResponseModel> LoginAsync(LoginRequestModel request);

        Task<LoginResponseModel> RefreshTokenAsync();

        Task<bool> LogoutAsync();

        Task<bool> IsSessionValid(IsSessionValidRequestModel request);

        Task<UserProfileResponseModel> GetCurrentUserProfileAsync();

        Task<string> RegisterAsync(RegisterRequestModel request);

        Task<bool> RevokeAllTokensAsync(int userId);
    }
}
