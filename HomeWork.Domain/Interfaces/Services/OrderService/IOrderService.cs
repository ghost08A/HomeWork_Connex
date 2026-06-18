using HomeWork.Domain.RequestModels.OrderRequestModel;
using HomeWork.Domain.ResponseModels.OrderResponseModel;
using HomeWork.Domain.ResponseModels.ValueOptionResponseModel;
using HomeWork.Domain.Share.Errors;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeWork.Domain.Interfaces.Services.OrderService
{
    public interface IOrderService
    {
        Task<List<ValueOptionResponseModel<string>>> GetStatusOrder();
        Task<List<ValueOptionResponseModel<string>>> GetStatusOrderDetail();

        Task<GetOrderByIdResponseModel> GetOrderById(string orderId, CustomError error);


        Task<object> SearchOrderAsync(SearchOrderRequestModel request, CustomError error);
        Task<string> UpsertOrder(UpsertOrderRequestModel request, CustomError error);

    }
}
