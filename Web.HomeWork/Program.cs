using HomeWork.Domain.Interfaces.Services.AuthService;
using HomeWork.Domain.Models;
using HomeWork.Service.ImplementServices.AuthService;
using Web.HomeWork.Middleware.ExceptionMiddleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using System.Text;
// using connex_project.Data; // เอาคอมเมนต์ออกเมื่อดึงไฟล์ Database เสร็จแล้ว

var builder = WebApplication.CreateBuilder(args);

// 1. นำเข้า Controllers
builder.Services.AddControllers();

// 2. ตั้งค่า Swagger (แบบไม่มี Key)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // อนุญาตเฉพาะ URL ของหน้าบ้านเรา
              .AllowAnyHeader()                     // อนุญาตทุก Header (เช่น Authorization)
              .AllowAnyMethod();                    // อนุญาตทุก HTTP Method (GET, POST, PUT, DELETE)
    });
});
builder.Services.AddDbContext<connexContext>(options =>
                options.UseNpgsql(
                    builder.Configuration.GetConnectionString("PostgresConnection")


                )
 );

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, //คือการตรวจสอบว่า Token นี้ถูกออกโดย Issuer ที่เรากำหนดไว้หรือไม่
            ValidateAudience = true, // คือการตรวจสอบว่า Token นี้ถูกออกให้กับ Audience ที่เรากำหนดไว้หรือไม่
            ValidateLifetime = true, // คือการตรวจสอบว่า Token นี้ยังไม่หมดอายุหรือไม่
            ValidateIssuerSigningKey = true, // คือการตรวจสอบว่า Token นี้ถูกเซ็นด้วยคีย์ที่เรากำหนดไว้หรือไม่
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
            ClockSkew = TimeSpan.Zero // สำคัญมาก! ปิดการทดเวลาของระบบ เพื่อให้หมดอายุตรงเป๊ะ 2 นาที
        };
    });

builder.Services.AddHttpContextAccessor(); // เพื่อให้ Service สามารถเข้าถึง HttpContext ได้ (เช่น ดึงข้อมูล User จาก Token)



// 3. เรียกใช้ระบบ Auto Dependency Injection (สแกน Service และ Repository อัตโนมัติ)
RegisterDIForCustomerService(builder);

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();
app.UseCors("AllowAngularApp"); //เรียกใช้งาน CROS
// 4. การตั้งค่า HTTP Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Web.HomeWork API v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI as the home page
    });
}

app.UseAuthentication(); // ตรวจสอบ Token
app.UseAuthorization(); // ตรวจสอบสิทธิ์การเข้าถึง Resource

app.MapControllers(); // กำหนดให้ใช้ Controllers เป็น Endpoint หลัก


//app.UseHttpsRedirection();

app.UseAuthorization();
app.MapControllers();

app.Run();

// ==========================================
// ฟังก์ชันสำหรับสแกนและจับคู่ DI อัตโนมัติ (Auto DI)
// ==========================================

static void RegisterDIForCustomerService(WebApplicationBuilder builder)
{
    var interfaceAssemblyShared = Assembly.GetAssembly(typeof(IAuthService)).GetTypes().Where(x => x.Name.EndsWith("Service"));
    var assemblyShared = Assembly.GetAssembly(typeof(AuthService)).GetTypes().Where(x => x.Name.EndsWith("Service"));
    foreach (var @interface in interfaceAssemblyShared)
    {
        var interfaceName = @interface.Name;
        var implement = assemblyShared.FirstOrDefault(c => c.IsClass && interfaceName.Substring(1) == c.Name);
        if (implement != null && implement.Name != "CacheService")
            builder.Services.AddScoped(@interface, implement);
    }

}
