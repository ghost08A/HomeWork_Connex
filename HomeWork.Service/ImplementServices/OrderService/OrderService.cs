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

        public async Task<GetOrderByIdResponseModel> GetOrderById(string orderId, CustomError error)
        {
            if (string.IsNullOrWhiteSpace(orderId))
            {
                error.AddError("orderId", "กรุณาระบุรหัสออเดอร์");
                error.ThrowIfError();
            }

            var order = await _context.Orders
                .AsNoTracking()
                .Where(o => o.OrderId == orderId)
                .Select(o => new GetOrderByIdResponseModel
                {
                    OrderId = o.OrderId,
                    StatusOrders = o.StatusOrderCode,
                    UpdatedAt = o.UpdatedAt,

                    OrderDetails = o.OrderDetails
                    .OrderBy(od => od.Seq)
                    .Select(od => new OrderDetailItemResponseModel
                    {
                        OrderDetailId = od.OrderDetailId,
                        Sequence = od.Seq,

                        ProductId = od.ProductId,
                        ProductName = od.Product.ProductName,
                        Description = od.Product.Detail,

                        CategoryNames = od.Product.ProductCategories
                            .Select(pc => pc.Category.CategoryName)
                            .ToList(),

                        Quantity = od.Quantity,
                        StatusOrderDetailCode = od.StatusOrderDetailCode,
                        Remark = od.Remark,

                        ReturnedQuantity = od.ReturnedQuantity,
                        ReturnedAt = od.ReturnedAt,
                        ReturnRemark = od.ReturnRemark
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();

            if (order == null)
            {
                error.AddError("orderId", "ไม่พบข้อมูลออเดอร์");
                error.ThrowIfError();
            }

            return order!;
        }


        public async Task<object> SearchOrderAsync(SearchOrderRequestModel request, CustomError error)
        {
            var user = _tokenService.GetCurrentUser();
            var query = _context.Orders.AsNoTracking().AsQueryable();

            if (user != null)
            {
                bool isAdmin = user.Roles != null && user.Roles.Any(r => r.Equals("admin", StringComparison.OrdinalIgnoreCase) || r.Equals("ADMIN", StringComparison.OrdinalIgnoreCase));
                if (!isAdmin)
                {
                    // ถ้าไม่ใช่ admin ให้ดูได้เฉพาะออเดอร์ของตัวเอง
                    query = query.Where(o => o.CreatedBy == user.UserId);
                }
            }

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

        public async Task<string> UpsertOrder(UpsertOrderRequestModel request, CustomError error)
        {
            var user = _tokenService.GetCurrentUser();
            var timeNow = DateTime.UtcNow;

            ValidateRequest(request, error);
            error.ThrowIfError();

            bool isCreate = string.IsNullOrWhiteSpace(request.OrderId);
            Order order;
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (isCreate)
                {
                    var newOrderId = await GenerateOrderIdAsync();
                    order = new Order
                    {
                        OrderId = newOrderId,
                        CreatedAt = timeNow,
                        CreatedBy = user.UserId,
                        UpdatedAt = timeNow,
                        UpdatedBy = user.UserId,
                        OrderDetails = new List<OrderDetail>()
                    };

                    _context.Orders.Add(order);
                }
                else
                {
                    order = await _context.Orders
                        .Include(x => x.OrderDetails)
                        .FirstOrDefaultAsync(x => x.OrderId == request.OrderId);

                    if (order == null)
                    {
                        error.AddError("ไม่พบข้อมูลออเดอร์");
                        error.ThrowIfError();
                    }

                    if (request.UpdatedAt.HasValue && request.UpdatedAt < order.UpdatedAt)
                    {
                        error.AddError("เวอร์ชั่นไม่ตรงกัน กรุณาลองใหม่อีกครั้ง");
                    }
                    error.ThrowIfError();
                }
                await ValidateOrderStockAsync(request, error);
                error.ThrowIfError();
                var productIds = request.OrderDetails
                    .Select(x => x.ProductId)
                    .Distinct()
                    .ToList();

                var productPrices = await _context.Products
                    .Where(x => productIds.Contains(x.ProductId))
                    .Select(x => new
                    {
                        x.ProductId,
                        x.Price
                    })
                    .ToDictionaryAsync(x => x.ProductId, x => x.Price);


                order.StatusOrderCode = request.StatusOrders;

                if (!isCreate)
                {
                    order.UpdatedAt = timeNow;
                    order.UpdatedBy = user.UserId;

                    var requestDetailIds = request.OrderDetails
                        .Where(x => x.OrderDetailId.HasValue && x.OrderDetailId.Value > 0)
                        .Select(x => x.OrderDetailId!.Value)
                        .ToList();

                    var deletedDetails = order.OrderDetails
                        .Where(x => !requestDetailIds.Contains(x.OrderDetailId))
                        .ToList();

                    if (deletedDetails.Any())
                    {
                        _context.OrderDetails.RemoveRange(deletedDetails);
                    }
                }
                foreach (var detailRequest in request.OrderDetails)
                {
                    OrderDetail orderDetail;

                    bool isNewDetail = !detailRequest.OrderDetailId.HasValue || detailRequest.OrderDetailId == 0;

                    if (isNewDetail)
                    {
                        orderDetail = new OrderDetail
                        {
                            OrderId = order.OrderId
                        };
                        orderDetail.StatusOrderDetailCode = "APPROVED";
                        if (detailRequest.ReturnedQuantity > 0)
                        {
                            error.AddError("ReturnedQuantity", "ไม่สามารถคืนสินค้าที่เพิ่งเพิ่มใหม่ได้");
                        }
                        order.OrderDetails.Add(orderDetail);
                    }
                    else
                    {
                        orderDetail = order.OrderDetails
                            .FirstOrDefault(x => x.OrderDetailId == detailRequest.OrderDetailId.Value);

                        if (orderDetail == null)
                        {
                            error.AddError("orderDetailId", $"ไม่พบรายการสินค้า ID: {detailRequest.OrderDetailId}");
                            continue;
                        }
                        if(request.StatusOrders != "APPROVED" && detailRequest.ReturnedQuantity > 0)
                        {
                            error.AddError("ไม่สามารถคืนสิาค้าในออเดอร์ที่ยังไม่อนุมัติได้");
                        }
                        orderDetail.StatusOrderDetailCode = detailRequest.StatusOrderDetailCode;
                    }

                    if (!productPrices.TryGetValue(detailRequest.ProductId, out var unitPrice))
                    {
                        error.AddError($"ไม่พบราคาสินค้า ProductId: {detailRequest.ProductId}");
                        continue;
                    }

                    bool isReturnedQuantityChanged = orderDetail.ReturnedQuantity != detailRequest.ReturnedQuantity;
                    orderDetail.ProductId = detailRequest.ProductId;
                    orderDetail.Seq = detailRequest.Sequence;
                    orderDetail.Quantity = detailRequest.Quantity;
                    orderDetail.UnitPrice = unitPrice;
                    orderDetail.Remark = detailRequest.Remark;
                    orderDetail.ReturnedQuantity = detailRequest.ReturnedQuantity;
                    orderDetail.ReturnRemark = detailRequest.ReturnRemark;

                    //จัดการเวลาคืนของ (ReturnedAt) ให้ถูกต้อง
                    if (detailRequest.ReturnedQuantity > 0)
                    {
                        if(orderDetail.Quantity > detailRequest.ReturnedQuantity)
                        {
                            orderDetail.StatusOrderDetailCode = "PARTIALRETURN";
                        }else if (orderDetail.Quantity == detailRequest.ReturnedQuantity)
                        {
                            orderDetail.StatusOrderDetailCode = "RETURNED";
                        }
                        else
                        {
                            error.AddError("ไม่สามารถคืนสินค้าได้มากกว่า");
                        }

                            if (isReturnedQuantityChanged)
                        {
                            orderDetail.ReturnedAt = timeNow;
                            
                        }
                    }
                    else
                    {
                        // ถ้ายอดคืนเป็น 0 ให้เคลียร์เวลาทิ้ง (เผื่อกรณีแอดมินกดยกเลิกการคืน)
                        orderDetail.ReturnedAt = null;
                    }
                }

                error.ThrowIfError();

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return order.OrderId;
               
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }


        private static void ValidateRequest(UpsertOrderRequestModel request, CustomError error)
        {
            if (string.IsNullOrWhiteSpace(request.StatusOrders))
            {
                error.AddError("STATUS_ORDER_REQUIRED", "กรุณาระบุสถานะออเดอร์");
            }

            if (request.OrderDetails == null || !request.OrderDetails.Any())
            {
                error.AddError("ORDER_DETAIL_REQUIRED", "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ");
                return;
            }

            foreach (var detail in request.OrderDetails)
            {
                if (detail.ProductId <= 0)
                {
                    error.AddError("PRODUCT_REQUIRED", "กรุณาเลือกสินค้าให้ครบทุกแถว");
                }

                if (detail.Quantity <= 0)
                {
                    error.AddError("QUANTITY_INVALID", "จำนวนสินค้าต้องมากกว่า 0");
                }

                if (detail.ReturnedQuantity < 0)
                {
                    error.AddError("RETURNED_QUANTITY_INVALID", "จำนวนคืนสินค้าห้ามติดลบ");
                }

                if (detail.ReturnedQuantity > detail.Quantity)
                {
                    error.AddError("RETURNED_QUANTITY_OVER", "จำนวนคืนสินค้าห้ามมากกว่าจำนวนที่เบิก");
                }
            }
        }

        private async Task ValidateOrderStockAsync(UpsertOrderRequestModel request, CustomError error)
        {
            var requestProducts = request.OrderDetails
                .GroupBy(x => x.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    RequestQuantity = g.Sum(x => x.Quantity)
                })
                .ToList();

            var productIds = requestProducts
                .Select(x => x.ProductId)
                .ToList();

            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId))
                .Select(p => new
                {
                    p.ProductId,
                    p.ProductName,
                    StockQuantity = p.Quantity,

                    BookedQuantity = p.OrderDetails
                        .Where(od =>
                            od.Order.StatusOrderCode == "APPROVED" &&
                            (
                                od.StatusOrderDetailCode == "APPROVED" ||
                                od.StatusOrderDetailCode == "RETURNED" ||
                                od.StatusOrderDetailCode == "PARTIALRETURN"
                            )
                        )
                        .Sum(od => od.Quantity - od.ReturnedQuantity)
                })
                .ToListAsync();

            foreach (var requestProduct in requestProducts)
            {
                var product = products.FirstOrDefault(x => x.ProductId == requestProduct.ProductId);

                if (product == null)
                {
                    error.AddError("productId", $"ไม่พบสินค้า ProductId: {requestProduct.ProductId}");
                    continue;
                }

                var availableQuantity = product.StockQuantity - product.BookedQuantity;

                if (requestProduct.RequestQuantity > availableQuantity)
                {
                    error.AddError(
                        "quantity",
                        $"สินค้า {product.ProductName} คงเหลือ {availableQuantity} แต่ต้องการเบิก {requestProduct.RequestQuantity}"
                    );
                }
            }
        }
        private async Task<string> GenerateOrderIdAsync()
        {
            var currentYear = DateTime.Now.Year;

            var runningNumber = await _context.RunningNumbers
                .FromSqlRaw("SELECT * FROM \"RunningNumber\" WHERE \"Year\" = {0} FOR UPDATE", currentYear)
                .FirstOrDefaultAsync();

            if (runningNumber == null)
            {
                runningNumber = new RunningNumber
                {
                    Year = currentYear,
                    LastNumber = 1
                };

                await _context.RunningNumbers.AddAsync(runningNumber);
            }
            else
            {
                runningNumber.LastNumber += 1;
            }

            await _context.SaveChangesAsync();

            //  รีเทิร์นค่าแบบมีเลข 0 นำหน้า
            return $"{currentYear}-{runningNumber.LastNumber.ToString("D5")}";
        }
    }
}
