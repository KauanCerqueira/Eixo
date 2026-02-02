using Eixo.Infrastructure;
using Eixo.Infrastructure.Data;
using Eixo.Api.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
    { 
        Title = "Eixo API", 
        Version = "v1",
        Description = "API para gerenciamento familiar gamificado"
    });
});

// Security Services
builder.Services.AddScoped<Eixo.Core.Interfaces.IPasswordHasher, Eixo.Infrastructure.Services.BCryptHasher>();

// Add JWT Authentication
// Priority: Environment Variable -> Configuration -> Default (Dev only)
var jwtKey = Environment.GetEnvironmentVariable("EIXO_JWT_KEY") 
             ?? builder.Configuration["Jwt:Key"] 
             ?? "EixoSecretKeyForJwtTokenGeneration2024!";

if (builder.Environment.IsProduction() && jwtKey.Length < 32)
{
    throw new Exception("JWT Key is too short or missing in Production environment!");
}

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "Eixo";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "EixoApp";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
        
        // Allow JWT in SignalR connections
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// Add SignalR for real-time notifications
builder.Services.AddSignalR();
builder.Services.AddSingleton<INotificationService, NotificationService>();

// Add Infrastructure (SQLite)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=eixo.db";
builder.Services.AddInfrastructure(connectionString);

// CORS for React Native + SignalR
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Initialize database on startup
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<EixoDbContext>();
    
    // Apply migrations (creates database if not exists)
    db.Database.Migrate();
    Console.WriteLine("✅ Database migrated successfully");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Database migration failed: {ex.Message}");
    // In production, you might want to log this but continue, or fail fast.
    // For now we log and continue to allow debugging.
}

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Eixo API v1"));
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();

// Add authentication middleware
app.UseAuthentication();
app.UseAuthorization();

// Map SignalR Hub
app.MapHub<NotificationHub>("/hubs/notifications");

app.MapControllers();

app.Run();
