using HomeWork.Domain.ResponseModels.NavbarResponseModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.Interfaces.Services.NavbarService
{
    public interface INavbarService
    {
        Task<List<NavbarResponseModel>> GetMenusByRoleAsync(string roleCode);
    }
}
