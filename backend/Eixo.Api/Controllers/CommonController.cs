using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Eixo.Core.Entities;
using Eixo.Infrastructure.Data;
using Eixo.Api.Hubs;

namespace Eixo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShoppingController : ControllerBase
{
    private readonly EixoDbContext _context;
    private readonly INotificationService _notifications;

    public ShoppingController(EixoDbContext context, INotificationService notifications)
    {
        _context = context;
        _notifications = notifications;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShoppingItem>>> GetItems()
    {
        return await _context.ShoppingItems
            .Include(s => s.AddedBy)
            .OrderBy(s => s.IsBought)
            .ThenByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<ShoppingItem>> CreateItem(CreateShoppingItemDto dto)
    {
        var addedBy = await _context.Users.FindAsync(dto.AddedByUserId);
        
        var item = new ShoppingItem
        {
            Name = dto.Name,
            Quantity = dto.Quantity,
            AddedByUserId = dto.AddedByUserId
        };

        _context.ShoppingItems.Add(item);
        await _context.SaveChangesAsync();

        // Broadcast real-time notification
        await _notifications.NotifyShoppingItemAdded(dto.Name, addedBy?.Name ?? "Alguém");

        return CreatedAtAction(nameof(GetItems), new { id = item.Id }, item);
    }

    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleItem(int id)
    {
        var item = await _context.ShoppingItems.FindAsync(id);
        if (item == null)
            return NotFound();

        item.IsBought = !item.IsBought;
        await _context.SaveChangesAsync();

        return Ok(new { isBought = item.IsBought });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.ShoppingItems.FindAsync(id);
        if (item == null)
            return NotFound();

        _context.ShoppingItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateShoppingItemDto(string Name, string Quantity = "1", int AddedByUserId = 1);

[ApiController]
[Route("api/[controller]")]
public class EventsController : ControllerBase
{
    private readonly EixoDbContext _context;

    public EventsController(EixoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AgendaEvent>>> GetEvents()
    {
        return await _context.Events
            .OrderBy(e => e.Date)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<AgendaEvent>> CreateEvent(CreateEventDto dto)
    {
        var ev = new AgendaEvent
        {
            Title = dto.Title,
            Date = dto.Date,
            Time = dto.Time,
            IsFamily = dto.IsFamily
        };

        _context.Events.Add(ev);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEvents), new { id = ev.Id }, ev);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEvent(int id)
    {
        var ev = await _context.Events.FindAsync(id);
        if (ev == null)
            return NotFound();

        _context.Events.Remove(ev);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateEventDto(string Title, DateTime Date, TimeSpan? Time = null, bool IsFamily = true);

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly EixoDbContext _context;

    public NotificationsController(EixoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Notification>>> GetNotifications([FromQuery] int? userId = null)
    {
        var query = _context.Notifications.AsQueryable();
        
        if (userId.HasValue)
            query = query.Where(n => n.UserId == userId || n.UserId == null);
        
        return await query
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsRead(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
            return NotFound();

        notification.IsRead = true;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotification(int id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification == null)
            return NotFound();

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

[ApiController]
[Route("api/[controller]")]
public class NoticesController : ControllerBase
{
    private readonly EixoDbContext _context;
    private readonly INotificationService _notifications;

    public NoticesController(EixoDbContext context, INotificationService notifications)
    {
        _context = context;
        _notifications = notifications;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Notice>>> GetNotices()
    {
        return await _context.Notices
            .Include(n => n.Author)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Notice>> CreateNotice(CreateNoticeDto dto)
    {
        var author = await _context.Users.FindAsync(dto.AuthorId);
        
        var notice = new Notice
        {
            Text = dto.Text,
            AuthorId = dto.AuthorId,
            Type = dto.Type
        };

        _context.Notices.Add(notice);
        await _context.SaveChangesAsync();

        // Broadcast real-time notification
        await _notifications.NotifyNewNotice(dto.Text, author?.Name ?? "Alguém");

        return CreatedAtAction(nameof(GetNotices), new { id = notice.Id }, notice);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteNotice(int id)
    {
        var notice = await _context.Notices.FindAsync(id);
        if (notice == null)
            return NotFound();

        _context.Notices.Remove(notice);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateNoticeDto(string Text, int AuthorId, string Type = "info");
