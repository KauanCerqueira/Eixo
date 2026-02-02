namespace Eixo.Core.Entities;

public class RecurringTask
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = "casa"; // casa, compras, pagamentos, manutencao
    public string Frequency { get; set; } = "weekly"; // daily, weekly, monthly
    public string Type { get; set; } = "recurring"; // recurring, sporadic
    
    public DateTime? ScheduledDate { get; set; } // For sporadic tasks
    public int? DayOfWeek { get; set; } // 0=Sunday, 6=Saturday
    public int? DayOfMonth { get; set; }
    
    public int PointsOnTime { get; set; } = 50;
    public int PointsLatePerDay { get; set; } = 5;
    
    public bool IsDone { get; set; } = false;
    public DateTime? LastCompleted { get; set; }
    public int? CompletedByUserId { get; set; }
    public User? CompletedBy { get; set; }
    
    public string DistributionStrategy { get; set; } = "auto"; // auto, manual
    public int CurrentAssigneeIndex { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public ICollection<TaskAssignment> Assignments { get; set; } = new List<TaskAssignment>();
    public ICollection<TaskCompletion> Completions { get; set; } = new List<TaskCompletion>();
}

public class TaskAssignment
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public RecurringTask Task { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int Order { get; set; }
}

public class TaskCompletion
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public RecurringTask Task { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;
    public int PointsEarned { get; set; }
    public bool WasLate { get; set; } = false;
}
