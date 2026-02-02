using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Eixo.Infrastructure.Data;

/// <summary>
/// Factory for EF Core design-time tools (migrations, scaffolding)
/// </summary>
public class EixoDbContextFactory : IDesignTimeDbContextFactory<EixoDbContext>
{
    public EixoDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<EixoDbContext>();
        optionsBuilder.UseSqlite("Data Source=eixo.db");
        
        return new EixoDbContext(optionsBuilder.Options);
    }
}
