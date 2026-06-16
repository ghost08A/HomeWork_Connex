using HomeWork.Domain.Interfaces.Services.OrderService;
using HomeWork.Domain.RequestModels.OrderRequestModel;
using HomeWork.Domain.Share.Errors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Web.HomeWork.Controllers.OrderController
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("OrderStatus")]
        public async Task<IActionResult> GetOrderStatus()
        {
            var orderStatus = await _orderService.GetStatusOrder();
            return Ok(orderStatus);
        }

        [HttpGet("OrderDetailStatus")]
        public async Task<IActionResult> GetStatusDetailOrder()
        {
            var orderStatusDetail = await _orderService.GetStatusOrderDetail();
            return Ok(orderStatusDetail);
        }

        [HttpPost("SearchOrder")]
        public async Task<IActionResult> SearchOrder(SearchOrderRequestModel request)
        {
            CustomError error = new CustomError();
            var result = await _orderService.SearchOrderAsync(request, error);
            return Ok(result);
        }
    }
}
