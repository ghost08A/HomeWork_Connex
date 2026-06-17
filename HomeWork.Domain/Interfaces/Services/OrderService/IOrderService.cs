using HomeWork.Domain.RequestModels.OrderRequestModel;
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
        Task<object> SearchOrderAsync(SearchOrderRequestModel request, CustomError error);
        Task UpsertOrder(UpsertOrderRequestModel request, CustomError error);

    }
}
