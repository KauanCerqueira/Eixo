using Eixo.Infrastructure;
using Eixo.Infrastructure.Data;
using Eixo.Api.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using Eixo.Api.Services;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:5000");

// Add services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
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
builder.Services.AddSingleton<PushDeviceStore>();
builder.Services.AddHttpClient<IPushNotificationService, ExpoPushNotificationService>();

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

    // First choice: apply migrations.
    db.Database.Migrate();
    EnsureSqliteCompatibilityColumns(db);

    // Promote legacy master user to role-based auth if needed.
    var legacyMaster = db.Users.FirstOrDefault(u => u.Name == "Kauan Cerqueira");
    if (legacyMaster is not null && string.IsNullOrWhiteSpace(legacyMaster.FamilyRole))
    {
        legacyMaster.FamilyRole = "master";
    }
    if (legacyMaster is not null && legacyMaster.FamilyRole != "master")
    {
        legacyMaster.FamilyRole = "master";
    }
    if (db.Users.Any() && !db.Users.Any(u => u.FamilyRole == "master"))
    {
        var first = db.Users.OrderBy(u => u.Id).First();
        first.FamilyRole = "master";
    }

    // Cleanup legacy seeded/demo rows from older versions.
    var seededNames = new[] { "Ana", "João", "Maria" };
    var onlyLegacyUsers = db.Users.Count() == 3 &&
                          db.Users.All(u => seededNames.Contains(u.Name));

    if (onlyLegacyUsers)
    {
        db.Users.RemoveRange(db.Users);
    }

    var onlyLegacyRewards = db.Rewards.Count() == 4 &&
                            db.Rewards.Any(r => r.Title == "Folga da Louça");
    if (onlyLegacyRewards)
    {
        db.Rewards.RemoveRange(db.Rewards);
    }

    var onlyLegacySubscriptions = db.Subscriptions.Count() == 3 &&
                                  db.Subscriptions.Any(s => s.Title == "Netflix");
    if (onlyLegacySubscriptions)
    {
        db.Subscriptions.RemoveRange(db.Subscriptions);
    }

    if (onlyLegacyUsers || onlyLegacyRewards || onlyLegacySubscriptions)
    {
        db.SaveChanges();
        Console.WriteLine("🧹 Legacy demo seed data removed");
    }
    else
    {
        db.SaveChanges();
    }

    Console.WriteLine("✅ Database migrated successfully");
}
catch (Exception migrateEx)
{
    Console.WriteLine($"❌ Database migration failed: {migrateEx.Message}");

    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<EixoDbContext>();
        db.Database.EnsureCreated();
        EnsureSqliteCompatibilityColumns(db);
        Console.WriteLine("✅ Database schema created via EnsureCreated fallback");
    }
    catch (Exception ensureEx)
    {
        Console.WriteLine($"❌ Database initialization fallback failed: {ensureEx.Message}");
        throw;
    }
}

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Eixo API v1"));
}

app.UseCors("AllowAll");
// app.UseHttpsRedirection();

// Add authentication middleware
app.UseAuthentication();
app.UseAuthorization();

// Map SignalR Hub
app.MapHub<NotificationHub>("/hubs/notifications");

app.MapControllers();

app.Run();

static void EnsureSqliteCompatibilityColumns(EixoDbContext db)
{
    try
    {
        var provider = db.Database.ProviderName ?? string.Empty;
        if (!provider.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
            return;

        // Users
        db.Database.ExecuteSqlRaw("ALTER TABLE Users ADD COLUMN FamilyRole TEXT NOT NULL DEFAULT 'member';");
    }
    catch { }

    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE Users ADD COLUMN FamilyRelation TEXT NULL;");
    }
    catch { }

    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE Events ADD COLUMN Description TEXT NULL;");
    }
    catch { }

    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE Events ADD COLUMN Location TEXT NULL;");
    }
    catch { }

    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE Events ADD COLUMN CreatedByUserId INTEGER NULL;");
    }
    catch { }

    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE GoalContributions ADD COLUMN UserId INTEGER NULL;");
    }
    catch { }

    try
    {
        db.Database.ExecuteSqlRaw("ALTER TABLE StudySessions ADD COLUMN Topic TEXT NULL;");
    }
    catch { }
}
