using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Eixo.Core.Entities;
using Eixo.Infrastructure.Data;

namespace Eixo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly EixoDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(EixoDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    /// <summary>
    /// Login with PIN (simple family auth)
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        // Find user by name and PIN
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Name.ToLower() == request.Name.ToLower());

        if (user == null)
            return Unauthorized(new { message = "Usuário não encontrado" });

        // For family app, we use a simple PIN check
        // In production, you'd hash the PIN
        if (user.Pin != request.Pin)
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
                Xp = user.Xp
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
            Xp = user.Xp
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
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "EixoSecretKeyForJwtTokenGeneration2024!"));
        
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
}
