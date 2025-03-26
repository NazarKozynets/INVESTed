using System.Text.Json;
using System.Text.Json.Serialization;
using server.services.auth;
using server.Services.DataBase;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()   
            .AllowAnyMethod()  
            .AllowAnyHeader(); 
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

//Время жизни: Объект создается один раз на весь срок жизни приложения (AddSingleton)
builder.Services.AddSingleton<MongoDbService>();

//Объект создается для каждого HTTP-запроса (AddScoped)
builder.Services.AddScoped<AuthService>();

var app = builder.Build();

app.UseCors("AllowAll");
app.MapControllers();

app.Run();