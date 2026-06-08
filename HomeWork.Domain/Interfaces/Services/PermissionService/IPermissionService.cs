using HomeWork.Domain.ResponseModels.PermissionResponseModel;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.Interfaces.Services.PermissionService
{
    public interface IPermissionService
    {
        Task<PrivPageResponseModel> GetPrivPageAsync(string pageCode);
    }
}
