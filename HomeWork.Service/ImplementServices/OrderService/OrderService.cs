using HomeWork.Domain.Interfaces.Services.OrderService;
using HomeWork.Domain.Interfaces.Services.TokenService;
using HomeWork.Domain.Models;
using HomeWork.Domain.RequestModels.OrderRequestModel;
using HomeWork.Domain.ResponseModels.OrderResponseModel;
using HomeWork.Domain.ResponseModels.ValueOptionResponseModel;
using HomeWork.Domain.Share.Errors;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Service.ImplementServices.OrderService
{
    public class OrderService : IOrderService
    {

        private readonly connexContext _context;
        private readonly ITokenService _tokenService;

        public OrderService(connexContext context, ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<List<ValueOptionResponseModel<string>>> GetStatusOrder()
        {
            var statusOrder = await _context.StatusOrders
                .AsNoTracking()
                .Select(s => new ValueOptionResponseModel<string>
                {
                    Key = s.StatusOrderCode,
                    Value = s.StatusOrderName
                }).ToListAsync();
            return statusOrder;
        }

        public async Task<List<ValueOptionResponseModel<string>>> GetStatusOrderDetail()
        {
            var statusDetailOrder = await _context.StatusOrderDetails
                .AsNoTracking()
                .Select(s => new ValueOptionResponseModel<string>
                {
                    Key = s.StatusOrderDetailCode,
                    Value = s.StatusOrderDetailName
                }).ToListAsync();
            return statusDetailOrder;
        }


        public async Task<object> SearchOrderAsync(SearchOrderRequestModel request, CustomError error)
        {
            var query = _context.Orders.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.Keyword))
            {
                query = query.Where(o => o.OrderId.Contains(request.Keyword));
            }
            if(request.StatusOrder != null && request.StatusOrder.Any())
            {
                query = query.Where(o => request.StatusOrder.Contains(o.StatusOrderCode));
            }
            if (request.StartDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= request.StartDate.Value);
            }
            if (request.EndDate.HasValue)
            {
                query = query.Where(o => o.CreatedAt <= request.EndDate.Value);
            }
            if (request.ProductIds != null && request.ProductIds.Any())
            {
                query = query.Where(o => o.OrderDetails.Any(od => request.ProductIds.Contains(od.ProductId)));
            }


            var selectQuery = query.Select(o => new OrderSearchResponseModel
            {
                OrderId = o.OrderId,

                ActionBy = o.UpdatedBy == null
                     ? "ไม่ทราบ"
                     : _context.Users
                        .Where(user => user.UserId == o.UpdatedBy)
                        .Select(user => user.FirstName + " " + user.LastName)
                        .FirstOrDefault(),
                StatusOrder = o.StatusOrderCode,
                OrderDate = o.CreatedAt,

                Products = o.OrderDetails.Select(od => new OrderProductResponseModel
                {
                    ProductId = od.ProductId,
                    ProductName = od.Product.ProductName,
                    Status = od.StatusOrderDetailCode,
                    Price = od.UnitPrice,
                    Quantity = od.Quantity
                }).ToList()
            });

            return await DevExtreme.AspNet.Data.DataSourceLoader.LoadAsync(selectQuery, request.LoadOptions);


        }
    }
}
