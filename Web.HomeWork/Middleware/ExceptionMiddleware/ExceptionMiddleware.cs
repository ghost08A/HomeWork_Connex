using System.Net;
using System.Text.Json;
using HomeWork.Domain.Share.Errors;
using Microsoft.AspNetCore.Http; // บางทีต้องใช้สำหรับ HttpContext

namespace Web.HomeWork.Middleware.ExceptionMiddleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            // 🌟 1. ดักจับ CustomError ของเรา (มีแค่บล็อกเดียวแล้วครับ)
            catch (CustomError ex)
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

                var formattedErrors = new List<object>();

                // กรณีที่ 1: ส่งแบบระบุช่อง (มี Field) เช่น error.AddError("Username", "ไม่พบผู้ใช้");
                if (ex.ErrorList != null && ex.ErrorList.Count > 0)
                {
                    foreach (var errorGroup in ex.ErrorList)
                    {
                        var fieldName = errorGroup.Key;
                        foreach (var err in errorGroup.Value)
                        {
                            var cleanMessage = err.Message.StartsWith("- ") ? err.Message.Substring(2) : err.Message;
                            formattedErrors.Add(new { field = fieldName, message = cleanMessage });
                        }
                    }
                }
                // กรณีที่ 2: ส่งแบบดั้งเดิม (ไม่มี Field) เช่น error.AddError("หรัสผิดเดอร์");
                else if (ex.ErrorMessage != null && ex.ErrorMessage.Count > 0)
                {
                    foreach (var err in ex.ErrorMessage)
                    {
                        var cleanMessage = err.StartsWith("- ") ? err.Substring(2) : err;
                        formattedErrors.Add(new { field = "General", message = cleanMessage });
                    }
                }

                var response = new
                {
                    message = "Validation Failed",
                    errors = formattedErrors
                };

                var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
                var json = JsonSerializer.Serialize(response, jsonOptions);

                await context.Response.WriteAsync(json);
            }
            // 🌟 2. ดักจับ Error ร้ายแรงอื่นๆ (เช่น Database พัง)
            catch (Exception ex)
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError; // ส่ง 500

                var actualError = ex.InnerException != null ? ex.InnerException.Message : ex.Message;

                var response = new
                {
                    Message = "Database Error!",
                    Details = actualError // ส่งตัวที่แงะออกมาไปให้หน้าบ้าน
                };

                var json = JsonSerializer.Serialize(response);
                await context.Response.WriteAsync(json);
            }
        }
    }
}