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
                Points = user.Points,
                Level = user.Level,
                Xp = user.Xp,
                Streak = user.Streak // Added Streak
            }
        });
    }

    /// <summary>
    /// Quick login (select user without PIN)
    /// </summary>
    [HttpPost("quick-login")]
    public async Task<ActionResult<AuthResponse>> QuickLogin([FromBody] QuickLoginRequest request)
    {
        var user = await _context.Users.FindAsync(request.UserId);

        if (user == null)
            return NotFound(new { message = "Usuário não encontrado" });

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
                Points = user.Points,
                Level = user.Level,
                Xp = user.Xp
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
}

// Request/Response DTOs
public record LoginRequest(string Name, string Pin);
public record QuickLoginRequest(int UserId);

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
    public int Points { get; set; }
    public int Level { get; set; }
    public int Xp { get; set; }
    public int Streak { get; set; }
}
