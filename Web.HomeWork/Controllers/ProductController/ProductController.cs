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

        [HttpGet("Categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _productService.GetGategories();
            return Ok(categories);
        }

        [HttpGet("Statuses")]
        public async Task<IActionResult> GetStatuses()
        {
            var statuses = await _productService.GetStatus();
            return Ok(statuses);
        }

        [HttpPost("ProductSearch")]
        public async Task<IActionResult> ProductSearch(ProductSearchRequestModel request)
        {
            CustomError error = new CustomError();
            var result = await _productService.SearchProductsAsync(request, error);
            return Ok(result);
        }

        [HttpPost("CreateProduct")]
        public async Task<IActionResult> CreateProduct(CreateProductRequestModel request)
        {
            CustomError error = new CustomError();
            await _productService.CreateProductAsync(request, error);
            return Ok();
        }

        [HttpPut("UpdateProduct")]
        public async Task<IActionResult> UpdateProduct(UpdateProductRequestModel request)
        {
            CustomError error = new CustomError();
            await _productService.UpdateProductAsync(request, error);
            return Ok();
        }

    }
}
