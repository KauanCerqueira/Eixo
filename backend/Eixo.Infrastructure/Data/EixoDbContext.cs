using Microsoft.EntityFrameworkCore;
using Eixo.Core.Entities;

namespace Eixo.Infrastructure.Data;

public class EixoDbContext : DbContext
{
    public EixoDbContext(DbContextOptions<EixoDbContext> options) : base(options) { }

    // Core
    public DbSet<User> Users => Set<User>();
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    
    // Tasks
    public DbSet<RecurringTask> Tasks => Set<RecurringTask>();
    public DbSet<TaskAssignment> TaskAssignments => Set<TaskAssignment>();
    public DbSet<TaskCompletion> TaskCompletions => Set<TaskCompletion>();
    
    // Finance
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<ExpenseSplit> ExpenseSplits => Set<ExpenseSplit>();
    public DbSet<Income> Incomes => Set<Income>();
    public DbSet<Debt> Debts => Set<Debt>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<GoalContribution> GoalContributions => Set<GoalContribution>();
    
    // Common
    public DbSet<ShoppingItem> ShoppingItems => Set<ShoppingItem>();
    public DbSet<AgendaEvent> Events => Set<AgendaEvent>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Notice> Notices => Set<Notice>();
    
    // Rewards
    public DbSet<Reward> Rewards => Set<Reward>();
    public DbSet<RewardRedemption> RewardRedemptions => Set<RewardRedemption>();
    
    // Personal/EU Mode
    public DbSet<PersonalTransaction> PersonalTransactions => Set<PersonalTransaction>();
    public DbSet<PersonalHabit> PersonalHabits => Set<PersonalHabit>();
    public DbSet<Hobby> Hobbies => Set<Hobby>();
    public DbSet<HobbyNote> HobbyNotes => Set<HobbyNote>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<WorkoutSession> WorkoutSessions => Set<WorkoutSession>();
    public DbSet<WorkoutExercise> WorkoutExercises => Set<WorkoutExercise>();
    public DbSet<ExerciseSet> ExerciseSets => Set<ExerciseSet>();
    public DbSet<MealLog> MealLogs => Set<MealLog>();
    public DbSet<StudySession> StudySessions => Set<StudySession>();
    public DbSet<CycleDay> CycleDays => Set<CycleDay>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // User Settings 1:1
        modelBuilder.Entity<User>()
            .HasOne(u => u.Settings)
            .WithOne(s => s.User)
            .HasForeignKey<UserSettings>(s => s.UserId);
        
        // Task Assignments
        modelBuilder.Entity<TaskAssignment>()
            .HasOne(ta => ta.Task)
            .WithMany(t => t.Assignments)
            .HasForeignKey(ta => ta.TaskId);
        
        modelBuilder.Entity<TaskAssignment>()
            .HasOne(ta => ta.User)
            .WithMany()
            .HasForeignKey(ta => ta.UserId);
        
        // Expense Splits
        modelBuilder.Entity<ExpenseSplit>()
            .HasOne(es => es.Expense)
            .WithMany(e => e.Splits)
            .HasForeignKey(es => es.ExpenseId);
        
        // Goal Contributions
        modelBuilder.Entity<GoalContribution>()
            .HasOne(gc => gc.Goal)
            .WithMany(g => g.Contributions)
            .HasForeignKey(gc => gc.GoalId);
        
        // Hobby Notes
        modelBuilder.Entity<HobbyNote>()
            .HasOne(hn => hn.Hobby)
            .WithMany(h => h.Notes)
            .HasForeignKey(hn => hn.HobbyId);
        
        // Workout Relations
        modelBuilder.Entity<WorkoutExercise>()
            .HasOne(we => we.Session)
            .WithMany(ws => ws.Exercises)
            .HasForeignKey(we => we.SessionId);
        
        modelBuilder.Entity<ExerciseSet>()
            .HasOne(es => es.Exercise)
            .WithMany(we => we.Sets)
            .HasForeignKey(es => es.ExerciseId);
        
        // Seed initial users
        modelBuilder.Entity<User>().HasData(
            new User { Id = 1, Name = "Ana", Initials = "AN", Color = "#3B82F6", Points = 145, Xp = 500, Level = 1, Streak = 7 },
            new User { Id = 2, Name = "João", Initials = "JO", Color = "#10B981", Points = 98, Xp = 300, Level = 1, Streak = 2 },
            new User { Id = 3, Name = "Maria", Initials = "MA", Color = "#F59E0B", Points = 132, Xp = 450, Level = 1, Streak = 4 }
        );
        
        // Seed rewards
        modelBuilder.Entity<Reward>().HasData(
            new Reward { Id = 1, Title = "Folga da Louça", Cost = 100, Icon = "🍽️", Description = "Vale uma vez ficar sem lavar louça." },
            new Reward { Id = 2, Title = "Escolher Jantar", Cost = 250, Icon = "🍕", Description = "Direito de escolher o cardápio do fds." },
            new Reward { Id = 3, Title = "Vale Cinema", Cost = 500, Icon = "🎬", Description = "Entrada paga pelo fundo da casa." },
            new Reward { Id = 4, Title = "Manhã de Domingo", Cost = 800, Icon = "☕", Description = "Café na cama e sem tarefas até 12h." }
        );
        
        // Seed subscriptions
        modelBuilder.Entity<Subscription>().HasData(
            new Subscription { Id = 1, Title = "Netflix", Amount = 55.90m, DueDateDay = 15, Category = "streaming" },
            new Subscription { Id = 2, Title = "Internet Fibra", Amount = 129.90m, DueDateDay = 8, Category = "utilidade" },
            new Subscription { Id = 3, Title = "Spotify Familia", Amount = 34.90m, DueDateDay = 1, Category = "streaming" }
        );
    }
}
