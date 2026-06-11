using HomeWork.Domain.Interfaces.Services.ProductService;
using HomeWork.Domain.RequestModels.ProductRequestModel;
using HomeWork.Domain.Share.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Web.HomeWork.Controllers.ProductController
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductController : ControllerBase
    {

        private readonly IProductService _productService;

        public ProductController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpPost("ProductSearch")]
        public async Task<IActionResult> ProductSearch(ProductSearchRequestModel request)
        {
            CustomError error = new CustomError();
            var result = await _productService.SearchProductsAsync(request, error);
            return Ok(result);
        }
    }
}
