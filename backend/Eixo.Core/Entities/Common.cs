namespace Eixo.Core.Entities;

public class ShoppingItem
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Quantity { get; set; } = "1";
    public bool IsBought { get; set; } = false;
    public int AddedByUserId { get; set; }
    public User AddedBy { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class AgendaEvent
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public TimeSpan? Time { get; set; }
    public bool IsFamily { get; set; } = true;
    public string Type { get; set; } = "event"; // event, task_instance
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Notification
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;
    public string Type { get; set; } = "task"; // task, expense, event, achievement
    public int? UserId { get; set; }
    public User? User { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Notice
{
    public int Id { get; set; }
    public string Text { get; set; } = string.Empty;
    public int AuthorId { get; set; }
    public User Author { get; set; } = null!;
    public string Type { get; set; } = "info"; // info, alert, status
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
