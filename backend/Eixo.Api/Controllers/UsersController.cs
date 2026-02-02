using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Eixo.Core.Entities;
using Eixo.Infrastructure.Data;

namespace Eixo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly EixoDbContext _context;

    public UsersController(EixoDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all users (family members)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users
            .Include(u => u.Settings)
            .ToListAsync();
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Settings)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null)
            return NotFound();

        return user;
    }

    /// <summary>
    /// Update user
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User user)
    {
        if (id != user.Id)
            return BadRequest();

        _context.Entry(user).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Users.AnyAsync(u => u.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    /// <summary>
    /// Get gamification leaderboard
    /// </summary>
    [HttpGet("leaderboard")]
    public async Task<ActionResult<IEnumerable<object>>> GetLeaderboard()
    {
        var users = await _context.Users
            .OrderByDescending(u => u.Points)
            .Select(u => new
            {
                u.Id,
                u.Name,
                u.Initials,
                u.Color,
                u.Points,
                u.Xp,
                u.Level,
                u.Streak,
                u.TasksCompleted
            })
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// Get user settings
    /// </summary>
    [HttpGet("{id}/settings")]
    public async Task<ActionResult<UserSettings>> GetUserSettings(int id)
    {
        var settings = await _context.UserSettings
            .FirstOrDefaultAsync(s => s.UserId == id);

        if (settings == null)
        {
            // Create default settings
            settings = new UserSettings { UserId = id };
            _context.UserSettings.Add(settings);
            await _context.SaveChangesAsync();
        }

        return settings;
    }

    /// <summary>
    /// Update user settings
    /// </summary>
    [HttpPut("{id}/settings")]
    public async Task<IActionResult> UpdateUserSettings(int id, UserSettings settings)
    {
        var existing = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == id);
        
        if (existing == null)
        {
            settings.UserId = id;
            _context.UserSettings.Add(settings);
        }
        else
        {
            existing.TrackCycle = settings.TrackCycle;
            existing.DailyWaterGoal = settings.DailyWaterGoal;
            existing.DailyCalorieGoal = settings.DailyCalorieGoal;
            existing.Weight = settings.Weight;
            existing.Height = settings.Height;
            existing.BirthDate = settings.BirthDate;
            existing.Bio = settings.Bio;
            existing.FocusHealth = settings.FocusHealth;
            existing.FocusCareer = settings.FocusCareer;
            existing.FocusSocial = settings.FocusSocial;
            existing.FocusSpirit = settings.FocusSpirit;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
