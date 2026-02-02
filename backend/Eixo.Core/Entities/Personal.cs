namespace Eixo.Core.Entities;

// Personal/EU Mode Entities

public class PersonalTransaction
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Type { get; set; } = "expense"; // income, expense
    public string Category { get; set; } = "outros";
    public string? Description { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class PersonalHabit
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = "saude"; // saude, fitness, estudo, produtividade
    public int Current { get; set; } = 0;
    public int Target { get; set; } = 1;
    public string Unit { get; set; } = "vezes";
    public string Color { get; set; } = "#10B981";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Hobby
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = "diy"; // diy, cursos, games, musica
    public int Progress { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<HobbyNote> Notes { get; set; } = new List<HobbyNote>();
}

public class HobbyNote
{
    public int Id { get; set; }
    public int HobbyId { get; set; }
    public Hobby Hobby { get; set; } = null!;
    public string Text { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class WishlistItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal Saved { get; set; } = 0;
    public string Priority { get; set; } = "medium"; // high, medium, low
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class WorkoutSession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Name { get; set; } = string.Empty;
    public int DurationMinutes { get; set; } = 0;
    public int? Calories { get; set; }
    public string? Intensity { get; set; } // low, medium, high
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<WorkoutExercise> Exercises { get; set; } = new List<WorkoutExercise>();
}

public class WorkoutExercise
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public WorkoutSession Session { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public int Order { get; set; }
    
    public ICollection<ExerciseSet> Sets { get; set; } = new List<ExerciseSet>();
}

public class ExerciseSet
{
    public int Id { get; set; }
    public int ExerciseId { get; set; }
    public WorkoutExercise Exercise { get; set; } = null!;
    public decimal Weight { get; set; }
    public int Reps { get; set; }
    public bool Done { get; set; } = false;
    public int Order { get; set; }
}

public class MealLog
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Type { get; set; } = "lunch"; // breakfast, lunch, dinner, snack
    public string Items { get; set; } = "[]"; // JSON array of items
    public int? Calories { get; set; }
    public int? Protein { get; set; }
    public int? Carbs { get; set; }
    public int? Fat { get; set; }
    public int WaterIntakeMl { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class StudySession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public string Subject { get; set; } = string.Empty;
    public int DurationMinutes { get; set; } = 0;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class CycleDay
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime Date { get; set; }
    public string? FlowIntensity { get; set; } // light, medium, heavy
    public string Symptoms { get; set; } = "[]"; // JSON array
    public string? Mood { get; set; } // happy, sad, anxious, irritable, neutral
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
