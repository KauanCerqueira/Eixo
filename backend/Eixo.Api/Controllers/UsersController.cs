using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Eixo.Core.Entities;
using Eixo.Infrastructure.Data;

namespace Eixo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private const string LegacyMasterUserName = "Kauan Cerqueira";
    private readonly EixoDbContext _context;

    public UsersController(EixoDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all users (family members)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponse>>> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Settings)
            .Select(u => new UserResponse
            {
                Id = u.Id,
                Name = u.Name,
                Initials = u.Initials,
                Color = u.Color,
                FamilyRole = u.FamilyRole,
                FamilyRelation = u.FamilyRelation,
                Points = u.Points,
                Xp = u.Xp,
                Level = u.Level,
                TasksCompleted = u.TasksCompleted,
                Streak = u.Streak,
                CreatedAt = u.CreatedAt,
                Settings = u.Settings
            })
            .ToListAsync();

        return Ok(users);
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserResponse>> GetUser(int id)
    {
        var user = await _context.Users
            .Include(u => u.Settings)
            .Select(u => new UserResponse
            {
                Id = u.Id,
                Name = u.Name,
                Initials = u.Initials,
                Color = u.Color,
                FamilyRole = u.FamilyRole,
                FamilyRelation = u.FamilyRelation,
                Points = u.Points,
                Xp = u.Xp,
                Level = u.Level,
                TasksCompleted = u.TasksCompleted,
                Streak = u.Streak,
                CreatedAt = u.CreatedAt,
                Settings = u.Settings
            })
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
                u.FamilyRole,
                u.FamilyRelation,
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
    public async Task<IActionResult> UpdateUserSettings(int id, [FromBody] UpdateUserSettingsDto settings)
    {
        var userExists = await _context.Users.AnyAsync(u => u.Id == id);
        if (!userExists)
            return NotFound(new { message = "Usuário não encontrado" });

        var existing = await _context.UserSettings.FirstOrDefaultAsync(s => s.UserId == id);
        
        if (existing == null)
        {
            var created = new UserSettings
            {
                UserId = id,
                TrackCycle = settings.TrackCycle ?? false,
                DailyWaterGoal = settings.DailyWaterGoal ?? 2000,
                DailyCalorieGoal = settings.DailyCalorieGoal ?? 2000,
                Weight = settings.Weight,
                Height = settings.Height,
                BirthDate = settings.BirthDate,
                Bio = settings.Bio,
                FocusHealth = settings.FocusHealth ?? 50,
                FocusCareer = settings.FocusCareer ?? 50,
                FocusSocial = settings.FocusSocial ?? 50,
                FocusSpirit = settings.FocusSpirit ?? 50
            };

            _context.UserSettings.Add(created);
        }
        else
        {
            if (settings.TrackCycle.HasValue) existing.TrackCycle = settings.TrackCycle.Value;
            if (settings.DailyWaterGoal.HasValue) existing.DailyWaterGoal = settings.DailyWaterGoal.Value;
            if (settings.DailyCalorieGoal.HasValue) existing.DailyCalorieGoal = settings.DailyCalorieGoal.Value;
            if (settings.Weight.HasValue) existing.Weight = settings.Weight.Value;
            if (settings.Height.HasValue) existing.Height = settings.Height.Value;
            if (settings.BirthDate.HasValue) existing.BirthDate = settings.BirthDate.Value;
            if (settings.Bio is not null) existing.Bio = settings.Bio;
            if (settings.FocusHealth.HasValue) existing.FocusHealth = settings.FocusHealth.Value;
            if (settings.FocusCareer.HasValue) existing.FocusCareer = settings.FocusCareer.Value;
            if (settings.FocusSocial.HasValue) existing.FocusSocial = settings.FocusSocial.Value;
            if (settings.FocusSpirit.HasValue) existing.FocusSpirit = settings.FocusSpirit.Value;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Delete a user and all dependent data (master-only operation)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id, [FromQuery] int requesterId)
    {
        if (requesterId <= 0)
            return BadRequest(new { message = "requesterId é obrigatório" });

        var requester = await _context.Users.FindAsync(requesterId);
        if (requester == null)
            return Unauthorized(new { message = "Solicitante inválido" });

        if (!IsMasterOrAdmin(requester))
            return Forbid();

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Usuário não encontrado" });

        if (IsMaster(user))
            return BadRequest(new { message = "O usuário master não pode ser removido" });

        var totalUsers = await _context.Users.CountAsync();
        if (totalUsers <= 1)
            return BadRequest(new { message = "Não é possível remover o último usuário" });

        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            // Task relations
            var completedTasks = await _context.Tasks.Where(t => t.CompletedByUserId == id).ToListAsync();
            completedTasks.ForEach(t => t.CompletedByUserId = null);
            _context.TaskAssignments.RemoveRange(_context.TaskAssignments.Where(a => a.UserId == id));
            _context.TaskCompletions.RemoveRange(_context.TaskCompletions.Where(c => c.UserId == id));

            // Finance / common relations
            var expenseIds = await _context.Expenses.Where(e => e.PaidByUserId == id).Select(e => e.Id).ToListAsync();
            if (expenseIds.Count > 0)
            {
                _context.ExpenseSplits.RemoveRange(_context.ExpenseSplits.Where(s => expenseIds.Contains(s.ExpenseId)));
                _context.Expenses.RemoveRange(_context.Expenses.Where(e => expenseIds.Contains(e.Id)));
            }
            _context.ExpenseSplits.RemoveRange(_context.ExpenseSplits.Where(s => s.UserId == id));
            _context.Incomes.RemoveRange(_context.Incomes.Where(i => i.ReceivedByUserId == id));
            _context.Debts.RemoveRange(_context.Debts.Where(d => d.OwnerUserId == id));
            _context.ShoppingItems.RemoveRange(_context.ShoppingItems.Where(s => s.AddedByUserId == id));
            _context.Notices.RemoveRange(_context.Notices.Where(n => n.AuthorId == id));
            _context.Notifications.RemoveRange(_context.Notifications.Where(n => n.UserId == id));

            // Rewards / personal data
            _context.RewardRedemptions.RemoveRange(_context.RewardRedemptions.Where(r => r.UserId == id));
            _context.PersonalTransactions.RemoveRange(_context.PersonalTransactions.Where(p => p.UserId == id));
            _context.PersonalHabits.RemoveRange(_context.PersonalHabits.Where(p => p.UserId == id));
            _context.Hobbies.RemoveRange(_context.Hobbies.Where(h => h.UserId == id));
            _context.WishlistItems.RemoveRange(_context.WishlistItems.Where(w => w.UserId == id));
            _context.WorkoutSessions.RemoveRange(_context.WorkoutSessions.Where(w => w.UserId == id));
            _context.MealLogs.RemoveRange(_context.MealLogs.Where(m => m.UserId == id));
            _context.StudySessions.RemoveRange(_context.StudySessions.Where(s => s.UserId == id));
            _context.CycleDays.RemoveRange(_context.CycleDays.Where(c => c.UserId == id));
            _context.UserSettings.RemoveRange(_context.UserSettings.Where(s => s.UserId == id));

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            return NoContent();
        }
        catch (Exception)
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    /// <summary>
    /// Update family profile metadata (role/relation). Master/Admin only.
    /// </summary>
    [HttpPut("{id}/family-profile")]
    public async Task<IActionResult> UpdateFamilyProfile(
        int id,
        [FromQuery] int requesterId,
        [FromBody] UpdateFamilyProfileDto dto)
    {
        if (requesterId <= 0)
            return BadRequest(new { message = "requesterId é obrigatório" });

        var requester = await _context.Users.FindAsync(requesterId);
        if (requester == null)
            return Unauthorized(new { message = "Solicitante inválido" });

        if (!IsMasterOrAdmin(requester))
            return Forbid();

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound(new { message = "Usuário não encontrado" });

        var normalizedRole = NormalizeRole(dto.FamilyRole);
        if (normalizedRole == null)
            return BadRequest(new { message = "FamilyRole inválido. Use: master, admin ou member" });

        // Prevent demoting the last master.
        if (IsMaster(user) && normalizedRole != "master")
        {
            var masterCount = await _context.Users.CountAsync(u => (u.FamilyRole ?? "member").ToLower() == "master");
            if (masterCount <= 1)
                return BadRequest(new { message = "Não é possível remover o único usuário master" });
        }

        user.FamilyRole = normalizedRole;
        user.FamilyRelation = string.IsNullOrWhiteSpace(dto.FamilyRelation)
            ? null
            : dto.FamilyRelation.Trim();

        await _context.SaveChangesAsync();

        return Ok(new
        {
            user.Id,
            user.Name,
            user.FamilyRole,
            user.FamilyRelation
        });
    }

    private static string? NormalizeRole(string? value)
    {
        var role = (value ?? string.Empty).Trim().ToLowerInvariant();
        return role switch
        {
            "master" => "master",
            "admin" => "admin",
            "member" => "member",
            _ => null
        };
    }

    private static bool IsMasterOrAdmin(User user)
    {
        var role = (user.FamilyRole ?? string.Empty).Trim().ToLowerInvariant();
        if (role is "master" or "admin") return true;

        // Compatibility for legacy datasets.
        return string.Equals(user.Name, LegacyMasterUserName, StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsMaster(User user)
    {
        var role = (user.FamilyRole ?? string.Empty).Trim().ToLowerInvariant();
        if (role == "master") return true;

        // Compatibility for legacy datasets.
        return string.Equals(user.Name, LegacyMasterUserName, StringComparison.OrdinalIgnoreCase);
    }
}

public record UpdateUserSettingsDto(
    bool? TrackCycle = null,
    int? DailyWaterGoal = null,
    int? DailyCalorieGoal = null,
    decimal? Weight = null,
    int? Height = null,
    DateTime? BirthDate = null,
    string? Bio = null,
    int? FocusHealth = null,
    int? FocusCareer = null,
    int? FocusSocial = null,
    int? FocusSpirit = null
);

public class UserResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string FamilyRole { get; set; } = "member";
    public string? FamilyRelation { get; set; }
    public int Points { get; set; }
    public int Xp { get; set; }
    public int Level { get; set; }
    public int TasksCompleted { get; set; }
    public int Streak { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserSettings? Settings { get; set; }
}

public record UpdateFamilyProfileDto(
    string FamilyRole = "member",
    string? FamilyRelation = null
);
