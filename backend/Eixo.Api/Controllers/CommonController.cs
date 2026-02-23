using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Eixo.Core.Entities;
using Eixo.Infrastructure.Data;
using Eixo.Api.Hubs;
using Eixo.Api.Services;

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
        if (addedBy == null)
            return BadRequest(new { message = "Usuário que adicionou o item não encontrado" });
        
        var item = new ShoppingItem
        {
            Name = dto.Name,
            Quantity = dto.Quantity,
            AddedByUserId = dto.AddedByUserId
        };

        _context.ShoppingItems.Add(item);
        await _context.SaveChangesAsync();

        // Broadcast real-time notification
        await _notifications.NotifyShoppingItemAdded(dto.Name, addedBy?.Name ?? "Alguém", dto.AddedByUserId);

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
            .Include(e => e.CreatedBy)
            .OrderBy(e => e.Date)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<AgendaEvent>> CreateEvent(CreateEventDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            return BadRequest(new { message = "Título é obrigatório" });

        if (dto.CreatedByUserId.HasValue)
        {
            var creatorExists = await _context.Users.AnyAsync(u => u.Id == dto.CreatedByUserId.Value);
            if (!creatorExists)
                return BadRequest(new { message = "Usuário criador não encontrado" });
        }

        var ev = new AgendaEvent
        {
            Title = dto.Title.Trim(),
            Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
            Location = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim(),
            Date = dto.Date,
            Time = dto.Time,
            IsFamily = dto.IsFamily,
            Type = dto.Type,
            CreatedByUserId = dto.CreatedByUserId
        };

        _context.Events.Add(ev);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEvents), new { id = ev.Id }, ev);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEvent(int id, UpdateEventDto dto)
    {
        var ev = await _context.Events.FindAsync(id);
        if (ev == null)
            return NotFound();

        if (dto.Title is not null)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { message = "Título inválido" });
            ev.Title = dto.Title.Trim();
        }

        if (dto.Description is not null)
            ev.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();

        if (dto.Location is not null)
            ev.Location = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim();

        if (dto.Date.HasValue)
            ev.Date = dto.Date.Value;

        if (dto.Time.HasValue)
            ev.Time = dto.Time.Value;

        if (dto.IsFamily.HasValue)
            ev.IsFamily = dto.IsFamily.Value;

        if (!string.IsNullOrWhiteSpace(dto.Type))
            ev.Type = dto.Type.Trim();

        await _context.SaveChangesAsync();
        return NoContent();
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

public record CreateEventDto(
    string Title,
    DateTime Date,
    TimeSpan? Time = null,
    bool IsFamily = true,
    string Type = "event",
    string? Description = null,
    string? Location = null,
    int? CreatedByUserId = null
);

public record UpdateEventDto(
    string? Title = null,
    DateTime? Date = null,
    TimeSpan? Time = null,
    bool? IsFamily = null,
    string? Type = null,
    string? Description = null,
    string? Location = null
);

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly EixoDbContext _context;
    private readonly IPushNotificationService _pushNotifications;

    public NotificationsController(EixoDbContext context, IPushNotificationService pushNotifications)
    {
        _context = context;
        _pushNotifications = pushNotifications;
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

    [HttpPost("devices/register")]
    public async Task<IActionResult> RegisterPushDevice([FromBody] RegisterPushDeviceDto dto)
    {
        if (dto.UserId <= 0)
            return BadRequest(new { message = "UserId inválido" });

        if (string.IsNullOrWhiteSpace(dto.Token))
            return BadRequest(new { message = "Token é obrigatório" });

        var userExists = await _context.Users.AnyAsync(u => u.Id == dto.UserId);
        if (!userExists)
            return BadRequest(new { message = "Usuário não encontrado" });

        await _pushNotifications.RegisterDeviceAsync(dto.UserId, dto.Token);
        return Ok(new { success = true });
    }

    [HttpPost("devices/unregister")]
    public async Task<IActionResult> UnregisterPushDevice([FromBody] UnregisterPushDeviceDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token))
            return BadRequest(new { message = "Token é obrigatório" });

        await _pushNotifications.UnregisterDeviceAsync(dto.Token, dto.UserId);
        return Ok(new { success = true });
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
        var sanitizedText = (dto.Text ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(sanitizedText))
            return BadRequest(new { message = "Texto do aviso é obrigatório" });

        if (sanitizedText.Length > 400)
            return BadRequest(new { message = "Aviso muito longo (máx. 400 caracteres)" });

        var duplicatedRecently = await _context.Notices.AnyAsync(n =>
            n.AuthorId == dto.AuthorId &&
            n.Text == sanitizedText &&
            n.CreatedAt >= DateTime.UtcNow.AddSeconds(-20));

        if (duplicatedRecently)
            return Conflict(new { message = "Aviso duplicado em intervalo curto" });

        var author = await _context.Users.FindAsync(dto.AuthorId);
        if (author == null)
            return BadRequest(new { message = "Autor não encontrado" });
        
        var notice = new Notice
        {
            Text = sanitizedText,
            AuthorId = dto.AuthorId,
            Type = dto.Type
        };

        _context.Notices.Add(notice);

        // Persist personal notifications for all family members (including author).
        var recipients = await _context.Users
            .Select(u => u.Id)
            .ToListAsync();

        foreach (var userId in recipients)
        {
            _context.Notifications.Add(new Notification
            {
                Title = $"Aviso de {author.Name}",
                Message = sanitizedText,
                Type = "event",
                UserId = userId
            });
        }

        await _context.SaveChangesAsync();

        // Broadcast real-time notification
        await _notifications.NotifyNewNotice(sanitizedText, author.Name, dto.AuthorId, recipients);

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
public record RegisterPushDeviceDto(int UserId, string Token);
public record UnregisterPushDeviceDto(string Token, int? UserId = null);
