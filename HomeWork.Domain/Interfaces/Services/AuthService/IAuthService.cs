using HomeWork.Domain.RequestModels.AuthRequestModel;
using HomeWork.Domain.RequestModels.RefreshTokenRequestModel;
using HomeWork.Domain.ResponseModels.AuthResponseModel;

namespace HomeWork.Domain.Interfaces.Services.AuthService
{
    public interface IAuthService
    {
        Task<LoginResponseModel> LoginAsync(LoginRequestModel request);


        Task<LoginResponseModel> RefreshTokenAsync(RefreshTokenRequestModel request);

        Task<string> RegisterAsync(RegisterRequestModel request);
    }
}
