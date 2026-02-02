namespace Eixo.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public string Color { get; set; } = "#3B82F6";
    public string Pin { get; set; } = "1234"; // Simple PIN for family auth
    public int Points { get; set; } = 0;
    public int Xp { get; set; } = 0;
    public int Level { get; set; } = 1;
    public int TasksCompleted { get; set; } = 0;
    public int Streak { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public UserSettings? Settings { get; set; }
    public ICollection<RecurringTask> AssignedTasks { get; set; } = new List<RecurringTask>();
    public ICollection<Expense> PaidExpenses { get; set; } = new List<Expense>();
    public ICollection<Income> Incomes { get; set; } = new List<Income>();
    public ICollection<RewardRedemption> Redemptions { get; set; } = new List<RewardRedemption>();
}

public class UserSettings
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    public bool TrackCycle { get; set; } = false;
    public int DailyWaterGoal { get; set; } = 2000;
    public int DailyCalorieGoal { get; set; } = 2000;
    public decimal? Weight { get; set; }
    public int? Height { get; set; }
    public DateTime? BirthDate { get; set; }
    public string? Bio { get; set; }
    
    // Focus Areas (0-100)
    public int FocusHealth { get; set; } = 50;
    public int FocusCareer { get; set; } = 50;
    public int FocusSocial { get; set; } = 50;
    public int FocusSpirit { get; set; } = 50;
}
