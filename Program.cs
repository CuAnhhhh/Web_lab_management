using DATN.Controllers;
using DATN.DataContext;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "DATNPolicy",
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:3000",
                    "http://26.243.146.110:3000",
                    "http://26.197.203.65:3000",
                    "https://api.zerobounce.net"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    );
});
builder.Services.AddControllers();
builder.Services.AddSignalR(options =>
{
    options.KeepAliveInterval = TimeSpan.FromSeconds(15);
    options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
});
;

builder.Services.AddSwaggerGen();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnectionString"))
);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseCors("DATNPolicy");
app.UseAuthentication();
app.UseEndpoints(endpoints =>
{
    _ = endpoints.MapHub<ChatHub>("/chatHub");
});

app.MapControllers();

app.Run();
