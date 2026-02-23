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

        // Task completion/assignee relations
        modelBuilder.Entity<RecurringTask>()
            .HasOne(t => t.CompletedBy)
            .WithMany()
            .HasForeignKey(t => t.CompletedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<TaskCompletion>()
            .HasOne(tc => tc.Task)
            .WithMany(t => t.Completions)
            .HasForeignKey(tc => tc.TaskId);

        modelBuilder.Entity<TaskCompletion>()
            .HasOne(tc => tc.User)
            .WithMany()
            .HasForeignKey(tc => tc.UserId);

        // Finance ownership relations using explicit *UserId properties
        modelBuilder.Entity<Expense>()
            .HasOne(e => e.PaidBy)
            .WithMany(u => u.PaidExpenses)
            .HasForeignKey(e => e.PaidByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Income>()
            .HasOne(i => i.ReceivedBy)
            .WithMany(u => u.Incomes)
            .HasForeignKey(i => i.ReceivedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Debt>()
            .HasOne(d => d.Owner)
            .WithMany()
            .HasForeignKey(d => d.OwnerUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<ShoppingItem>()
            .HasOne(s => s.AddedBy)
            .WithMany()
            .HasForeignKey(s => s.AddedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Expense Splits
        modelBuilder.Entity<ExpenseSplit>()
            .HasOne(es => es.Expense)
            .WithMany(e => e.Splits)
            .HasForeignKey(es => es.ExpenseId);

        modelBuilder.Entity<ExpenseSplit>()
            .HasOne(es => es.User)
            .WithMany()
            .HasForeignKey(es => es.UserId);
        
        // Goal Contributions
        modelBuilder.Entity<GoalContribution>()
            .HasOne(gc => gc.Goal)
            .WithMany(g => g.Contributions)
            .HasForeignKey(gc => gc.GoalId);

        modelBuilder.Entity<GoalContribution>()
            .HasOne(gc => gc.User)
            .WithMany()
            .HasForeignKey(gc => gc.UserId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<AgendaEvent>()
            .HasOne(e => e.CreatedBy)
            .WithMany()
            .HasForeignKey(e => e.CreatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
        
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
        
        // No default/seeded content. All data must be created/imported by the user.
    }
}
