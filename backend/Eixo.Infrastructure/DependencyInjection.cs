using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Eixo.Infrastructure.Data;

namespace Eixo.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<EixoDbContext>(options =>
            options.UseSqlite(connectionString));
        
        return services;
    }
}
