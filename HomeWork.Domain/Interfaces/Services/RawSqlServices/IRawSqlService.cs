using HomeWork.Domain.ResponseModels.NavbarResponseModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.Interfaces.Services.RawSqlServices
{
    public interface IRawSqlService
    {
        Task<List<NavbarResponseModel>> GetNavbarByRolesAsync(List<string> userRoles);
    }
}
