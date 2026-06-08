using HomeWork.Domain.Interfaces.Services.PermissionService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Web.HomeWork.Controllers.PermissionController
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PermissionController : ControllerBase
    {
        private readonly IPermissionService _permissionService;

        public PermissionController(IPermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        [HttpGet("GetPrivPage/{pageCode}")]
        public async Task<IActionResult> GetPrivPage(string pageCode)
        {
            var result = await _permissionService.GetPrivPageAsync(pageCode);
            return Ok(result);

        }
    }
}
