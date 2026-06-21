using HomeWork.Domain.Models;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;
using HomeWork.Domain.Enums;

namespace HomeWork.Service.Helper
{
    public static class OrderDetailExtensions
    {
        public static readonly Expression<Func<OrderDetail, bool>> IsCountedAgainstStock =
            od => od.Order.StatusOrderCode == EnumOrderStatus.APPROVED &&
             (od.StatusOrderDetailCode == EnumOrderDetailStatus.APPROVED
              || od.StatusOrderDetailCode == EnumOrderDetailStatus.RETURNED
              || od.StatusOrderDetailCode == EnumOrderDetailStatus.PARTIALRETURN);

     
        public static IQueryable<OrderDetail> WhereCountedAgainstStock(this IQueryable<OrderDetail> source)
            => source.Where(IsCountedAgainstStock);

     
        public static IQueryable<OrderDetail> WhereCountedAgainstStock(this IEnumerable<OrderDetail> source)
            => source.AsQueryable().Where(IsCountedAgainstStock);
    }
}
