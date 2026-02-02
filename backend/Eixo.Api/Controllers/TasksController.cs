using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Eixo.Core.Entities;
using Eixo.Infrastructure.Data;
using Eixo.Api.Hubs;

namespace Eixo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly EixoDbContext _context;
    private readonly INotificationService _notifications;

    public TasksController(EixoDbContext context, INotificationService notifications)
    {
        _context = context;
        _notifications = notifications;
    }

    /// <summary>
    /// Get all tasks
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RecurringTask>>> GetTasks()
    {
        return await _context.Tasks
            .Include(t => t.Assignments)
                .ThenInclude(a => a.User)
            .Include(t => t.CompletedBy)
            .ToListAsync();
    }

    /// <summary>
    /// Get task by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<RecurringTask>> GetTask(int id)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignments)
                .ThenInclude(a => a.User)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null)
            return NotFound();

        return task;
    }

    /// <summary>
    /// Create a new task
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RecurringTask>> CreateTask(CreateTaskDto dto)
    {
        var task = new RecurringTask
        {
            Title = dto.Title,
            Category = dto.Category,
            Frequency = dto.Frequency,
            Type = dto.Type,
            ScheduledDate = dto.ScheduledDate,
            DayOfWeek = dto.DayOfWeek,
            DayOfMonth = dto.DayOfMonth,
            PointsOnTime = dto.PointsOnTime,
            PointsLatePerDay = dto.PointsLatePerDay,
            DistributionStrategy = dto.DistributionStrategy
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        // Add assignments
        if (dto.AssignedUserIds?.Any() == true)
        {
            for (int i = 0; i < dto.AssignedUserIds.Count; i++)
            {
                _context.TaskAssignments.Add(new TaskAssignment
                {
                    TaskId = task.Id,
                    UserId = dto.AssignedUserIds[i],
                    Order = i
                });
            }
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
    }

    /// <summary>
    /// Update a task
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTask(int id, UpdateTaskDto dto)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        task.Title = dto.Title ?? task.Title;
        task.Category = dto.Category ?? task.Category;
        task.Frequency = dto.Frequency ?? task.Frequency;
        task.PointsOnTime = dto.PointsOnTime ?? task.PointsOnTime;
        task.PointsLatePerDay = dto.PointsLatePerDay ?? task.PointsLatePerDay;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Delete a task
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task == null)
            return NotFound();

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Complete a task
    /// </summary>
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteTask(int id, [FromBody] CompleteTaskDto dto)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignments)
            .FirstOrDefaultAsync(t => t.Id == id);
            
        if (task == null)
            return NotFound();

        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null)
            return BadRequest("User not found");

        // Mark as done
        task.IsDone = true;
        task.LastCompleted = DateTime.UtcNow;
        task.CompletedByUserId = dto.UserId;

        // Award points
        var points = dto.WasLate ? task.PointsOnTime - (task.PointsLatePerDay * dto.DaysLate) : task.PointsOnTime;
        points = Math.Max(0, points);
        
        user.Points += points;
        user.Xp += points;
        user.TasksCompleted++;
        if (!dto.WasLate) user.Streak++;

        // Record completion
        _context.TaskCompletions.Add(new TaskCompletion
        {
            TaskId = id,
            UserId = dto.UserId,
            PointsEarned = points,
            WasLate = dto.WasLate
        });

        // Rotate assignee for next time
        if (task.Assignments.Count > 0)
        {
            task.CurrentAssigneeIndex = (task.CurrentAssigneeIndex + 1) % task.Assignments.Count;
        }

        // Reset isDone for recurring tasks
        if (task.Type == "recurring")
        {
            task.IsDone = false;
        }

        await _context.SaveChangesAsync();

        // Broadcast real-time notification
        await _notifications.NotifyTaskCompleted(task.Id, task.Title, user.Name, points);

        return Ok(new { pointsEarned = points });
    }
}

// DTOs
public record CreateTaskDto(
    string Title,
    string Category = "casa",
    string Frequency = "weekly",
    string Type = "recurring",
    DateTime? ScheduledDate = null,
    int? DayOfWeek = null,
    int? DayOfMonth = null,
    int PointsOnTime = 50,
    int PointsLatePerDay = 5,
    string DistributionStrategy = "auto",
    List<int>? AssignedUserIds = null
);

public record UpdateTaskDto(
    string? Title = null,
    string? Category = null,
    string? Frequency = null,
    int? PointsOnTime = null,
    int? PointsLatePerDay = null
);

public record CompleteTaskDto(
    int UserId,
    bool WasLate = false,
    int DaysLate = 0
);
