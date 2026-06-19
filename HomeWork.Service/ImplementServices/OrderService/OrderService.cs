using HomeWork.Domain.Interfaces.Services.OrderService;
using HomeWork.Domain.Interfaces.Services.TokenService;
using HomeWork.Domain.Models;
using HomeWork.Domain.RequestModels.OrderRequestModel;
using HomeWork.Domain.ResponseModels.OrderResponseModel;
using HomeWork.Domain.ResponseModels.ValueOptionResponseModel;
using HomeWork.Domain.Share.Errors;
using HomeWork.Service.Helper;
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
                    ReturnedQuantity = od.ReturnedQuantity,
                    Quantity = od.Quantity
                }).ToList()
            });

            return await DevExtreme.AspNet.Data.DataSourceLoader.LoadAsync(selectQuery, request.LoadOptions);
        }

        public async Task<string> UpsertOrder(UpsertOrderRequestModel request, CustomError error)
        {
            var user = _tokenService.GetCurrentUser();
            var timeNow = DateTime.UtcNow;

            ValidateRequest(request, error); //ตรวจสอบคร่าวๆ
            error.ThrowIfError();

            bool isCreate = string.IsNullOrWhiteSpace(request.OrderId);

            //เช็คrole
            bool isAdmin = false;
            if (user != null)
                isAdmin = user.Roles != null && user.Roles.Any(r => r.Equals("admin", StringComparison.OrdinalIgnoreCase) || r.Equals("ADMIN", StringComparison.OrdinalIgnoreCase));
            else
                error.AddError("popuperror", "ไม่พบผู้ใช้กรุณาลองใหม่อีกครั้ง");


            Order order;
            string? oldStatusOrderCode = null;
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                //สร้างข้อมูลเคร่าวๆ
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

                oldStatusOrderCode = order.StatusOrderCode; //เก็บสถานะเก่า
                                                            //เช็คว่าเบิกเกินมั้ย
                await ValidateOrderStockAsync(request, error);
                error.ThrowIfError();


                var productIds = request.OrderDetails
                    .Select(x => x.ProductId)
                    .Distinct()
                    .ToList();
                //ดึงราคาปัจจุบันของสินค้า
                var productPrices = await _context.Products
                    .Where(x => productIds.Contains(x.ProductId))
                    .Select(x => new
                    {
                        x.ProductId,
                        x.Price
                    })
                    .ToDictionaryAsync(x => x.ProductId, x => x.Price);

                bool isStatusChanged = isCreate || oldStatusOrderCode != request.StatusOrders;
                order.StatusOrderCode = request.StatusOrders;
                if (isStatusChanged) //ทำlogแค่ตอนอัพเดตสถานะ
                {
                    if (request.StatusOrders is "APPROVED" or "REJECTED" or "PENDING" && !isAdmin)
                    {
                        error.AddError("popuperror", "แกไม่มีสิทธ์");
                    }

                    order.UpdatedBy = user.UserId;
                    _context.LogOrders.Add(new LogOrder
                    {
                        OrderId = order.OrderId,
                        Action = isCreate ? "CREATE" : "UPDATE",
                        StatusOrderCode = order.StatusOrderCode,
                        CreatedAt = order.CreatedAt,
                        CreatedBy = order.CreatedBy,
                        UpdatedAt = isCreate ? null : timeNow,
                        UpdatedBy = isCreate ? null : user.UserId
                    });
                }

                if (!isCreate) //ถ้าอัพเดตให้หาตัวที่ไม่เกี่ยวข้องแล้วลบ
                {
                    order.UpdatedAt = timeNow;

                    var requestDetailIds = request.OrderDetails
                        .Where(x => x.OrderDetailId.HasValue && x.OrderDetailId.Value > 0)
                        .Select(x => x.OrderDetailId!.Value)
                        .ToList();

                    var deletedDetails = order.OrderDetails
                        .Where(x => !requestDetailIds.Contains(x.OrderDetailId))
                        .ToList();
                    if (deletedDetails.Any())
                    {
                        foreach (var deletedDetail in deletedDetails)
                        {
                            _context.LogOrderDetails.Add(new LogOrderDetail
                            {
                                OrderDetailId = deletedDetail.OrderDetailId,
                                OrderId = order.OrderId,
                                Action = "DELETE",
                                ProductId = deletedDetail.ProductId,
                                Seq = deletedDetail.Seq,
                                StatusOrderDetailCode = deletedDetail.StatusOrderDetailCode,
                                Remark = deletedDetail.Remark,
                                UnitPrice = deletedDetail.UnitPrice,
                                Quantity = deletedDetail.Quantity,
                                CreatedAt = deletedDetail.CreatedAt,
                                CreatedBy = deletedDetail.CreatedBy,
                                UpdatedAt = timeNow,
                                UpdatedBy = user.UserId,
                                ReturnedQuantity = deletedDetail.ReturnedQuantity,
                                ReturnedAt = deletedDetail.ReturnedAt,
                                ReturnRemark = deletedDetail.ReturnRemark
                            });
                        }
                        _context.OrderDetails.RemoveRange(deletedDetails);
                    }
                }
                var newOrderDetails = new List<OrderDetail>();

                foreach (var detailRequest in request.OrderDetails)
                {
                    OrderDetail orderDetail;
                    string detailAction;
                    bool shouldLockPrice = false;

                    bool isNewDetail = !detailRequest.OrderDetailId.HasValue || detailRequest.OrderDetailId <= 0;

                    if (isNewDetail)
                    {
                        if (oldStatusOrderCode is "APPROVED" or "REJECTED" or "WAITAPPROVE" or "PENDING")
                        {
                            error.AddError("popuperror", "ห้ามแก้ไขสินค้าในออเดอร์นี้");
                            error.ThrowIfError();
                        }
                        detailAction = "CREATE";
                        orderDetail = new OrderDetail
                        {
                            OrderId = order.OrderId,
                            CreatedAt = timeNow,
                            CreatedBy = user.UserId
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
                        detailAction = "UPDATE";
                        orderDetail = order.OrderDetails //หาออเดอร์เก่า
                            .FirstOrDefault(x => x.OrderDetailId == detailRequest.OrderDetailId.Value);

                        if (orderDetail == null)
                        {
                            error.AddError("popuperror", $"ไม่พบรายการสินค้า ID: {detailRequest.OrderDetailId}");
                            continue;
                        }

                        // ดูว่าค่าคืนเปลี่ยนมั้ย
                        bool isReturnedQuantityChanged = orderDetail.ReturnedQuantity != detailRequest.ReturnedQuantity;

                        // ดูว่าที่เข้ามาเป็นการคืนจริงมั้ย
                        bool isReturnAction = oldStatusOrderCode == "APPROVED"
                                               && isReturnedQuantityChanged
                                               && detailRequest.ReturnedQuantity > 0;

                        // detail นี้เคยถูกคืนไปแล้วอดีต
                        bool wasAlreadyReturned = orderDetail.StatusOrderDetailCode == "RETURNED"
                                                   || orderDetail.StatusOrderDetailCode == "PARTIALRETURN";

                        shouldLockPrice = wasAlreadyReturned || isReturnAction || oldStatusOrderCode == "APPROVED";

                        if (wasAlreadyReturned)
                        {
                            bool isTryingToChangeProtectedFields =
                                orderDetail.ProductId != detailRequest.ProductId ||
                                orderDetail.Quantity != detailRequest.Quantity ||
                                orderDetail.Seq != detailRequest.Sequence ||
                                orderDetail.Remark != detailRequest.Remark;

                            if (isTryingToChangeProtectedFields)
                            {
                                error.AddError("popuperror", $"ไม่สามารถแก้ไขรายละเอียดสินค้าที่คืนแล้วได้ (OrderDetailId: {orderDetail.OrderDetailId})");
                                continue;
                            }
                        }

                        if (isReturnAction)
                        {
                            bool isTryingToChangeProtectedFields =
                                orderDetail.ProductId != detailRequest.ProductId ||
                                orderDetail.Seq != detailRequest.Sequence ||
                                orderDetail.Remark != detailRequest.Remark;

                            if (isTryingToChangeProtectedFields)
                            {
                                error.AddError("popuperror", $"ไม่สามารถแก้ไขรายละเอียดสินค้าพร้อมกับการคืนของได้ (OrderDetailId: {orderDetail.OrderDetailId})");
                                continue;
                            }
                        }

                        //จัดการเวลาคืนของ (ReturnedAt) ให้ถูกต้อง
                        if (detailRequest.ReturnedQuantity > 0)
                        {
                            if (orderDetail.Quantity > detailRequest.ReturnedQuantity)
                            {
                                orderDetail.StatusOrderDetailCode = "PARTIALRETURN";
                            }
                            else if (orderDetail.Quantity == detailRequest.ReturnedQuantity)
                            {
                                orderDetail.StatusOrderDetailCode = "RETURNED";
                            }
                            else
                            {
                                error.AddError("popuperror", "ไม่สามารถคืนสินค้าได้มากกว่า");
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

                        if (request.StatusOrders != "APPROVED" && detailRequest.ReturnedQuantity > 0)
                        {
                            error.AddError("popuperror", "ไม่สามารถคืนสิาค้าในออเดอร์ที่ยังไม่อนุมัติได้");
                        }
                        orderDetail.StatusOrderDetailCode = detailRequest.StatusOrderDetailCode;
                        orderDetail.UpdatedAt = timeNow;
                        orderDetail.UpdatedBy = user.UserId;
                    }
                    decimal unitPrice;
                    if (shouldLockPrice)
                    {
                        unitPrice = orderDetail.UnitPrice; // ใช้ราคาเดิมที่บันทึกไว้แล้ว ไม่แตะ
                    }
                    else
                    {
                        if (!productPrices.TryGetValue(detailRequest.ProductId, out unitPrice))
                        {
                            error.AddError("pupuperror", $"ไม่พบราคาสินค้า ProductId: {detailRequest.ProductId}");
                            continue;
                        }
                    }

                    orderDetail.ProductId = detailRequest.ProductId;
                    orderDetail.Seq = detailRequest.Sequence;
                    orderDetail.Quantity = detailRequest.Quantity;
                    orderDetail.UnitPrice = unitPrice;
                    orderDetail.Remark = detailRequest.Remark;
                    orderDetail.ReturnedQuantity = detailRequest.ReturnedQuantity;
                    orderDetail.ReturnRemark = detailRequest.ReturnRemark;


                    if (isNewDetail)
                    {
                        newOrderDetails.Add(orderDetail); //เก็บไว้ก่อน
                    }
                    else
                    {
                        _context.LogOrderDetails.Add(new LogOrderDetail
                        {
                            OrderDetailId = orderDetail.OrderDetailId,
                            OrderId = order.OrderId,
                            Action = detailAction,
                            ProductId = orderDetail.ProductId,
                            Seq = orderDetail.Seq,
                            StatusOrderDetailCode = orderDetail.StatusOrderDetailCode,
                            Remark = orderDetail.Remark,
                            UnitPrice = orderDetail.UnitPrice,
                            Quantity = orderDetail.Quantity,
                            CreatedAt = orderDetail.CreatedAt,
                            CreatedBy = orderDetail.CreatedBy,
                            UpdatedAt = timeNow,
                            UpdatedBy = user.UserId,
                            ReturnedQuantity = orderDetail.ReturnedQuantity,
                            ReturnedAt = orderDetail.ReturnedAt,
                            ReturnRemark = orderDetail.ReturnRemark,
                        });
                    }


                }

                error.ThrowIfError();

                await _context.SaveChangesAsync();
                // Log รายการใหม่หลัง SaveChanges → OrderDetailId มีค่าแล้ว
                foreach (var newDetail in newOrderDetails)
                {
                    _context.LogOrderDetails.Add(new LogOrderDetail
                    {
                        OrderDetailId = newDetail.OrderDetailId, // ✅ มีค่าแล้ว
                        OrderId = order.OrderId,
                        Action = "CREATE",
                        ProductId = newDetail.ProductId,
                        Seq = newDetail.Seq,
                        StatusOrderDetailCode = newDetail.StatusOrderDetailCode,
                        Remark = newDetail.Remark,
                        UnitPrice = newDetail.UnitPrice,
                        Quantity = newDetail.Quantity,
                        CreatedAt = newDetail.CreatedAt,
                        CreatedBy = newDetail.CreatedBy,
                        UpdatedAt = null,
                        UpdatedBy = null,
                        ReturnedQuantity = newDetail.ReturnedQuantity,
                        ReturnedAt = newDetail.ReturnedAt,
                        ReturnRemark = newDetail.ReturnRemark,
                    });
                }

                await _context.SaveChangesAsync(); // บันทึก Log รายการใหม่

                await transaction.CommitAsync();
                return order.OrderId;

            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task DeleteOrder(string orderId, CustomError error)
        {
            var user = _tokenService.GetCurrentUser();

            if (string.IsNullOrWhiteSpace(orderId))
            {
                error.AddError("orderId", "กรุณาระบุรหัสออเดอร์");
                error.ThrowIfError();
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var order = await _context.Orders
                    .Include(x => x.OrderDetails)
                    .FirstOrDefaultAsync(x => x.OrderId == orderId);

                if (order == null)
                {
                    error.AddError("orderId", "ไม่พบข้อมูลออเดอร์");
                    error.ThrowIfError();
                }

                if (order.CreatedBy != user.UserId)
                {
                    error.AddError("permission", "ไม่สามารถลบออเดอร์ของผู้อื่นได้");
                    error.ThrowIfError();
                }


                if (order.StatusOrderCode == "APPROVED" || order.StatusOrderCode == "REJECTED")
                {
                    error.AddError("status", "ไม่สามารถลบออเดอร์ที่อนุมัติหรือปฏิเสธแล้วได้");
                    error.ThrowIfError();
                }

                if (order.OrderDetails.Any())
                {
                    _context.OrderDetails.RemoveRange(order.OrderDetails);
                }

                _context.Orders.Remove(order);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
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
                error.AddError("popuperror", "ไมาสามารภระบุสถานะออเดอร์ได้");
            }

            if (request.OrderDetails == null || !request.OrderDetails.Any())
            {
                error.AddError("popuperror", "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ");
                return;
            }

            foreach (var detail in request.OrderDetails)
            {
                if (detail.ProductId <= 0)
                {
                    error.AddError("popuperror", "กรุณาเลือกสินค้าให้ครบทุกแถว");
                }

                if (detail.Quantity <= 0)
                {
                    error.AddError("popuperror", "จำนวนสินค้าต้องมากกว่า 0");
                }

                if (detail.ReturnedQuantity < 0)
                {
                    error.AddError("popuperror", "จำนวนคืนสินค้าห้ามติดลบ");
                }

                if (detail.ReturnedQuantity > detail.Quantity)
                {
                    error.AddError("popuperror", "จำนวนคืนสินค้าห้ามมากกว่าจำนวนที่เบิก");
                }
            }
        }

        private async Task ValidateOrderStockAsync(UpsertOrderRequestModel request, CustomError error)
        {
            //รวมยอดสินค้าที่ user ขอเบิก
            var requestProducts = request.OrderDetails
                .GroupBy(x => x.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    RequestQuantity = g.Sum(x => x.Quantity)
                })
                .ToList();
            //ดึงเฉพาะ ProductId ที่ต้องใช้ไป query
            var productIds = requestProducts
                .Select(x => x.ProductId)
                .ToList();


            //ดึงข้อมูลสินค้า + คำนวณยอดที่ถูกเบิกไปแล้ว
            var products = await _context.Products
                .Where(p => productIds.Contains(p.ProductId))
                .Select(p => new
                {
                    p.ProductId,
                    p.ProductName,
                    StockQuantity = p.Quantity,

                    BookedQuantity = _context.OrderDetails
                        .Where(od => od.ProductId == p.ProductId)
                        .Where(OrderDetailExtensions.IsCountedAgainstStock)
                        .Sum(od => od.Quantity - od.ReturnedQuantity),
                })
                .ToListAsync();

            foreach (var requestProduct in requestProducts)
            {
                var product = products.FirstOrDefault(x => x.ProductId == requestProduct.ProductId);

                if (product == null)
                {
                    error.AddError("popuperror", $"ไม่พบสินค้า ProductId: {requestProduct.ProductId}");
                    continue;
                }
                //ดูว่ามีพอให้เบิกมั้ย
                var availableQuantity = product.StockQuantity - product.BookedQuantity;

                if (requestProduct.RequestQuantity > availableQuantity)
                {
                    error.AddError(
                        "popuperror",
                        $"สินค้า {product.ProductName} คงเหลือ {availableQuantity} แต่ต้องการเบิก {requestProduct.RequestQuantity}"
                    );
                }
            }
        }
        private async Task<string> GenerateOrderIdAsync()
        {
            var currentYear = DateTime.UtcNow.Year;

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
