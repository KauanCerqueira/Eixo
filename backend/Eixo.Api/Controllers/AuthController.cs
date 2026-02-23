using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Eixo.Core.Interfaces;
using Eixo.Core.Entities;
using Eixo.Infrastructure.Data;

namespace Eixo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly EixoDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IPasswordHasher _hasher;

    public AuthController(EixoDbContext context, IConfiguration configuration, IPasswordHasher hasher)
    {
        _context = context;
        _configuration = configuration;
        _hasher = hasher;
    }

    /// <summary>
    /// Login with PIN (simple family auth)
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request) // Changed return type to IActionResult
    {
        // Find user by name and PIN
        var user = await _context.Users
            .Include(u => u.Settings) // Added Include for Settings
            .FirstOrDefaultAsync(u => u.Name.ToLower() == request.Name.ToLower());

        if (user == null)
            return Unauthorized(new { message = "Usuário não encontrado" });

        // Verify PIN hash using the injected hasher
        if (!_hasher.VerifyPassword(request.Pin, user.Pin)) // Changed PIN verification
            return Unauthorized(new { message = "PIN incorreto" });

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Initials = user.Initials,
                Color = user.Color,
                FamilyRole = user.FamilyRole,
                FamilyRelation = user.FamilyRelation,
                Points = user.Points,
                Level = user.Level,
                Xp = user.Xp,
                Streak = user.Streak // Added Streak
            }
        });
    }

    /// <summary>
    /// Register a new family member
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        var name = request.Name?.Trim() ?? string.Empty;
        var pin = request.Pin?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(name))
            return BadRequest(new { message = "Nome é obrigatório" });

        if (pin.Length != 4 || !pin.All(char.IsDigit))
            return BadRequest(new { message = "PIN deve ter 4 dígitos" });

        var exists = await _context.Users.AnyAsync(u => u.Name.ToLower() == name.ToLower());
        if (exists)
            return Conflict(new { message = "Já existe um usuário com esse nome" });

        var palette = new[] { "#3B82F6", "#10B981", "#F59E0B", "#EC4899", "#6366F1", "#14B8A6", "#EF4444" };
        var initials = GetInitials(name);
        var color = palette[Math.Abs(name.GetHashCode()) % palette.Length];

        var isFirstUser = !await _context.Users.AnyAsync();

        var user = new User
        {
            Name = name,
            Initials = initials,
            Color = color,
            FamilyRole = isFirstUser ? "master" : "member",
            Pin = _hasher.HashPassword(pin),
            Points = 0,
            Xp = 0,
            Level = 1,
            Streak = 0,
            TasksCompleted = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Initials = user.Initials,
                Color = user.Color,
                FamilyRole = user.FamilyRole,
                FamilyRelation = user.FamilyRelation,
                Points = user.Points,
                Level = user.Level,
                Xp = user.Xp,
                Streak = user.Streak
            }
        });
    }

    /// <summary>
    /// Get current user info from token
    /// </summary>
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound();

        return Ok(new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Initials = user.Initials,
            Color = user.Color,
            FamilyRole = user.FamilyRole,
            FamilyRelation = user.FamilyRelation,
            Points = user.Points,
            Level = user.Level,
            Xp = user.Xp,
            Streak = user.Streak
        });
    }

    /// <summary>
    /// Validate token
    /// </summary>
    [HttpGet("validate")]
    public IActionResult ValidateToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(new { valid = false });

        return Ok(new { valid = true, userId = userIdClaim });
    }

    private string GenerateJwtToken(User user)
    {
        // Priority: Environment Variable -> Configuration -> Default
        var jwtKey = Environment.GetEnvironmentVariable("EIXO_JWT_KEY") 
                     ?? _configuration["Jwt:Key"] 
                     ?? "EixoSecretKeyForJwtTokenGeneration2024!";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim("initials", user.Initials),
            new Claim("color", user.Color)
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"] ?? "Eixo",
            audience: _configuration["Jwt:Audience"] ?? "EixoApp",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30), // Long token for family app
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GetInitials(string name)
    {
        var parts = name
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Take(2)
            .ToArray();

        if (parts.Length == 0)
            return "US";

        if (parts.Length == 1)
            return parts[0].Length >= 2
                ? parts[0][..2].ToUpperInvariant()
                : parts[0].ToUpperInvariant();

        return $"{parts[0][0]}{parts[1][0]}".ToUpperInvariant();
    }
}

// Request/Response DTOs
public record LoginRequest(string Name, string Pin);
public record RegisterRequest(string Name, string Pin);

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserDto User { get; set; } = new();
}

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string FamilyRole { get; set; } = "member";
    public string? FamilyRelation { get; set; }
    public int Points { get; set; }
    public int Level { get; set; }
    public int Xp { get; set; }
    public int Streak { get; set; }
}
