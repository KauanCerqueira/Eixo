using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Eixo.Core.Entities;
using Eixo.Infrastructure.Data;

namespace Eixo.Api.Controllers;

/// <summary>
/// Personal/EU Mode endpoints
/// </summary>
[ApiController]
[Route("api/personal")]
public class PersonalController : ControllerBase
{
    private readonly EixoDbContext _context;

    public PersonalController(EixoDbContext context)
    {
        _context = context;
    }

    // ==================== TRANSACTIONS ====================
    
    [HttpGet("transactions")]
    public async Task<ActionResult<IEnumerable<PersonalTransaction>>> GetTransactions([FromQuery] int userId)
    {
        return await _context.PersonalTransactions
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.Date)
            .ToListAsync();
    }

    [HttpPost("transactions")]
    public async Task<ActionResult<PersonalTransaction>> CreateTransaction(CreatePersonalTransactionDto dto)
    {
        var transaction = new PersonalTransaction
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Amount = dto.Amount,
            Type = dto.Type,
            Category = dto.Category,
            Description = dto.Description,
            Date = dto.Date ?? DateTime.UtcNow
        };

        _context.PersonalTransactions.Add(transaction);
        await _context.SaveChangesAsync();

        return Ok(transaction);
    }

    [HttpDelete("transactions/{id}")]
    public async Task<IActionResult> DeleteTransaction(int id)
    {
        var t = await _context.PersonalTransactions.FindAsync(id);
        if (t == null) return NotFound();
        _context.PersonalTransactions.Remove(t);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ==================== HABITS ====================

    [HttpGet("habits")]
    public async Task<ActionResult<IEnumerable<PersonalHabit>>> GetHabits([FromQuery] int userId)
    {
        return await _context.PersonalHabits
            .Where(h => h.UserId == userId)
            .ToListAsync();
    }

    [HttpPost("habits")]
    public async Task<ActionResult<PersonalHabit>> CreateHabit(CreateHabitDto dto)
    {
        var habit = new PersonalHabit
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Category = dto.Category,
            Target = dto.Target,
            Unit = dto.Unit,
            Color = dto.Color
        };

        _context.PersonalHabits.Add(habit);
        await _context.SaveChangesAsync();

        return Ok(habit);
    }

    [HttpPut("habits/{id}/increment")]
    public async Task<IActionResult> IncrementHabit(int id)
    {
        var habit = await _context.PersonalHabits.FindAsync(id);
        if (habit == null) return NotFound();
        
        if (habit.Current < habit.Target)
            habit.Current++;
        
        await _context.SaveChangesAsync();
        return Ok(new { current = habit.Current, target = habit.Target });
    }

    [HttpDelete("habits/{id}")]
    public async Task<IActionResult> DeleteHabit(int id)
    {
        var h = await _context.PersonalHabits.FindAsync(id);
        if (h == null) return NotFound();
        _context.PersonalHabits.Remove(h);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ==================== HOBBIES ====================

    [HttpGet("hobbies")]
    public async Task<ActionResult<IEnumerable<Hobby>>> GetHobbies([FromQuery] int userId)
    {
        return await _context.Hobbies
            .Where(h => h.UserId == userId)
            .Include(h => h.Notes)
            .ToListAsync();
    }

    [HttpPost("hobbies")]
    public async Task<ActionResult<Hobby>> CreateHobby(CreateHobbyDto dto)
    {
        var hobby = new Hobby
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Category = dto.Category
        };

        _context.Hobbies.Add(hobby);
        await _context.SaveChangesAsync();

        return Ok(hobby);
    }

    [HttpPut("hobbies/{id}")]
    public async Task<IActionResult> UpdateHobby(int id, UpdateHobbyDto dto)
    {
        var hobby = await _context.Hobbies.FindAsync(id);
        if (hobby == null) return NotFound();

        if (dto.Progress.HasValue)
            hobby.Progress = Math.Min(100, dto.Progress.Value);
        
        if (!string.IsNullOrEmpty(dto.NewNote))
        {
            _context.HobbyNotes.Add(new HobbyNote { HobbyId = id, Text = dto.NewNote });
        }

        await _context.SaveChangesAsync();
        return Ok(hobby);
    }

    [HttpDelete("hobbies/{id}")]
    public async Task<IActionResult> DeleteHobby(int id)
    {
        var h = await _context.Hobbies.FindAsync(id);
        if (h == null) return NotFound();
        _context.Hobbies.Remove(h);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ==================== WISHLIST ====================

    [HttpGet("wishlist")]
    public async Task<ActionResult<IEnumerable<WishlistItem>>> GetWishlist([FromQuery] int userId)
    {
        return await _context.WishlistItems
            .Where(w => w.UserId == userId)
            .OrderBy(w => w.Priority)
            .ToListAsync();
    }

    [HttpPost("wishlist")]
    public async Task<ActionResult<WishlistItem>> CreateWishlistItem(CreateWishlistDto dto)
    {
        var item = new WishlistItem
        {
            UserId = dto.UserId,
            Title = dto.Title,
            Price = dto.Price,
            Priority = dto.Priority
        };

        _context.WishlistItems.Add(item);
        await _context.SaveChangesAsync();

        return Ok(item);
    }

    [HttpPut("wishlist/{id}")]
    public async Task<IActionResult> UpdateWishlist(int id, UpdateWishlistDto dto)
    {
        var item = await _context.WishlistItems.FindAsync(id);
        if (item == null) return NotFound();

        if (dto.AddToSaved.HasValue)
            item.Saved += dto.AddToSaved.Value;

        await _context.SaveChangesAsync();
        return Ok(item);
    }

    [HttpDelete("wishlist/{id}")]
    public async Task<IActionResult> DeleteWishlistItem(int id)
    {
        var w = await _context.WishlistItems.FindAsync(id);
        if (w == null) return NotFound();
        _context.WishlistItems.Remove(w);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // ==================== WORKOUTS ====================

    [HttpGet("workouts")]
    public async Task<ActionResult<IEnumerable<WorkoutSession>>> GetWorkouts([FromQuery] int userId)
    {
        return await _context.WorkoutSessions
            .Where(w => w.UserId == userId)
            .Include(w => w.Exercises)
                .ThenInclude(e => e.Sets)
            .OrderByDescending(w => w.Date)
            .ToListAsync();
    }

    [HttpPost("workouts")]
    public async Task<ActionResult<WorkoutSession>> CreateWorkout(CreateWorkoutDto dto)
    {
        var session = new WorkoutSession
        {
            UserId = dto.UserId,
            Name = dto.Name,
            Date = dto.Date ?? DateTime.UtcNow,
            DurationMinutes = dto.DurationMinutes,
            Calories = dto.Calories,
            Intensity = dto.Intensity,
            Notes = dto.Notes
        };

        _context.WorkoutSessions.Add(session);
        await _context.SaveChangesAsync();

        return Ok(session);
    }

    // ==================== MEALS ====================

    [HttpGet("meals")]
    public async Task<ActionResult<IEnumerable<MealLog>>> GetMeals([FromQuery] int userId, [FromQuery] DateTime? date = null)
    {
        var query = _context.MealLogs.Where(m => m.UserId == userId);
        
        if (date.HasValue)
            query = query.Where(m => m.Date.Date == date.Value.Date);
        
        return await query.OrderByDescending(m => m.Date).ToListAsync();
    }

    [HttpPost("meals")]
    public async Task<ActionResult<MealLog>> CreateMeal(CreateMealDto dto)
    {
        var meal = new MealLog
        {
            UserId = dto.UserId,
            Type = dto.Type,
            Items = System.Text.Json.JsonSerializer.Serialize(dto.Items),
            Calories = dto.Calories,
            Protein = dto.Protein,
            Carbs = dto.Carbs,
            Fat = dto.Fat,
            WaterIntakeMl = dto.WaterIntakeMl,
            Date = dto.Date ?? DateTime.UtcNow
        };

        _context.MealLogs.Add(meal);
        await _context.SaveChangesAsync();

        return Ok(meal);
    }

    // ==================== STUDY ====================

    [HttpGet("study")]
    public async Task<ActionResult<IEnumerable<StudySession>>> GetStudySessions([FromQuery] int userId)
    {
        return await _context.StudySessions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.Date)
            .ToListAsync();
    }

    [HttpPost("study")]
    public async Task<ActionResult<StudySession>> CreateStudySession(CreateStudyDto dto)
    {
        var session = new StudySession
        {
            UserId = dto.UserId,
            Subject = dto.Subject,
            DurationMinutes = dto.DurationMinutes,
            Notes = dto.Notes,
            Date = dto.Date ?? DateTime.UtcNow
        };

        _context.StudySessions.Add(session);
        await _context.SaveChangesAsync();

        return Ok(session);
    }

    // ==================== CYCLE ====================

    [HttpGet("cycle")]
    public async Task<ActionResult<IEnumerable<CycleDay>>> GetCycleDays([FromQuery] int userId)
    {
        return await _context.CycleDays
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.Date)
            .Take(90) // Last 3 months
            .ToListAsync();
    }

    [HttpPost("cycle")]
    public async Task<ActionResult<CycleDay>> CreateCycleDay(CreateCycleDayDto dto)
    {
        var existing = await _context.CycleDays
            .FirstOrDefaultAsync(c => c.UserId == dto.UserId && c.Date.Date == dto.Date.Date);

        if (existing != null)
        {
            existing.FlowIntensity = dto.FlowIntensity;
            existing.Symptoms = System.Text.Json.JsonSerializer.Serialize(dto.Symptoms);
            existing.Mood = dto.Mood;
            existing.Notes = dto.Notes;
        }
        else
        {
            var day = new CycleDay
            {
                UserId = dto.UserId,
                Date = dto.Date,
                FlowIntensity = dto.FlowIntensity,
                Symptoms = System.Text.Json.JsonSerializer.Serialize(dto.Symptoms),
                Mood = dto.Mood,
                Notes = dto.Notes
            };
            _context.CycleDays.Add(day);
        }

        await _context.SaveChangesAsync();
        return Ok(existing ?? await _context.CycleDays.FirstAsync(c => c.UserId == dto.UserId && c.Date.Date == dto.Date.Date));
    }
}

// DTOs
public record CreatePersonalTransactionDto(int UserId, string Title, decimal Amount, string Type = "expense", string Category = "outros", string? Description = null, DateTime? Date = null);
public record CreateHabitDto(int UserId, string Title, string Category = "saude", int Target = 1, string Unit = "vezes", string Color = "#10B981");
public record CreateHobbyDto(int UserId, string Title, string Category = "diy");
public record UpdateHobbyDto(int? Progress = null, string? NewNote = null);
public record CreateWishlistDto(int UserId, string Title, decimal Price, string Priority = "medium");
public record UpdateWishlistDto(decimal? AddToSaved = null);
public record CreateWorkoutDto(int UserId, string Name, DateTime? Date = null, int DurationMinutes = 0, int? Calories = null, string? Intensity = null, string? Notes = null);
public record CreateMealDto(int UserId, string Type = "lunch", List<string>? Items = null, int? Calories = null, int? Protein = null, int? Carbs = null, int? Fat = null, int WaterIntakeMl = 0, DateTime? Date = null);
public record CreateStudyDto(int UserId, string Subject, int DurationMinutes, string? Notes = null, DateTime? Date = null);
public record CreateCycleDayDto(int UserId, DateTime Date, string? FlowIntensity = null, List<string>? Symptoms = null, string? Mood = null, string? Notes = null);
