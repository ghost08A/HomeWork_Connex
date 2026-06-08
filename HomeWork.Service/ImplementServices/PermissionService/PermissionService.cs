using HomeWork.Domain.Interfaces.Services.PermissionService;
using HomeWork.Domain.Interfaces.Services.TokenService;
using HomeWork.Domain.Models;
using HomeWork.Domain.ResponseModels.NavbarResponseModel;
using HomeWork.Domain.ResponseModels.PermissionResponseModel;
using HomeWork.Domain.Share.Errors;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Service.ImplementServices.PermissionService
{
    public class PermissionService : IPermissionService
    {
        CustomError error = new CustomError();
        private readonly connexContext _context;
        private readonly ITokenService _TokenService; // เรียกใช้งาน TokenService

        public PermissionService(connexContext context, ITokenService TokenService)
        {
            _context = context;
            _TokenService = TokenService; // รับค่า TokenService ผ่าน Constructor
        }

        public async Task<PrivPageResponseModel> GetPrivPageAsync(string pageCode)
        {
            var currentUser = _TokenService.GetCurrentUser();
            var userRoles = await _context.UserRoles
                 .Where(user => user.UserId == currentUser.UserId)
                 .Select(user => user.RoleCode)
                 .ToListAsync();
            if (!userRoles.Any()) return new PrivPageResponseModel
            {
                CanAccess = false, 
                Permission = null,
            };

            var permissions = await _context.MapRolePages
                .Where(x => userRoles.Contains(x.RoleCode) && x.PageCode == pageCode)
                .Select(x => x.Permission)
                .ToListAsync();
            if (!permissions.Any())
            {
                return new PrivPageResponseModel { CanAccess = false, Permission = null };
            }
            string finalPermission = permissions.Contains("rw") ? "rw" : "r";

            return new PrivPageResponseModel { CanAccess = true, Permission = finalPermission };
        }
    }
}
