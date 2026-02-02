using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Eixo.Core.Entities;
using Eixo.Infrastructure.Data;
using Eixo.Api.Hubs;

namespace Eixo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly EixoDbContext _context;
    private readonly INotificationService _notifications;

    public ExpensesController(EixoDbContext context, INotificationService notifications)
    {
        _context = context;
        _notifications = notifications;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
    {
        return await _context.Expenses
            .Include(e => e.PaidBy)
            .Include(e => e.Splits)
                .ThenInclude(s => s.User)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Expense>> GetExpense(int id)
    {
        var expense = await _context.Expenses
            .Include(e => e.PaidBy)
            .Include(e => e.Splits)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (expense == null)
            return NotFound();

        return expense;
    }

    [HttpPost]
    public async Task<ActionResult<Expense>> CreateExpense(CreateExpenseDto dto)
    {
        var paidBy = await _context.Users.FindAsync(dto.PaidByUserId);
        
        var expense = new Expense
        {
            Title = dto.Title,
            Amount = dto.Amount,
            Category = dto.Category,
            PaidByUserId = dto.PaidByUserId,
            Date = dto.Date ?? DateTime.UtcNow
        };

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        // Create splits
        if (dto.SplitWithUserIds?.Any() == true)
        {
            var shareAmount = dto.Amount / dto.SplitWithUserIds.Count;
            foreach (var userId in dto.SplitWithUserIds)
            {
                _context.ExpenseSplits.Add(new ExpenseSplit
                {
                    ExpenseId = expense.Id,
                    UserId = userId,
                    ShareAmount = shareAmount
                });
            }
            await _context.SaveChangesAsync();
        }

        // Broadcast real-time notification
        await _notifications.NotifyNewExpense(dto.Title, dto.Amount, paidBy?.Name ?? "Alguém");

        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null)
            return NotFound();

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateExpenseDto(
    string Title,
    decimal Amount,
    string Category = "outros",
    int PaidByUserId = 1,
    DateTime? Date = null,
    List<int>? SplitWithUserIds = null
);

[ApiController]
[Route("api/[controller]")]
public class IncomesController : ControllerBase
{
    private readonly EixoDbContext _context;

    public IncomesController(EixoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Income>>> GetIncomes()
    {
        return await _context.Incomes
            .Include(i => i.ReceivedBy)
            .OrderByDescending(i => i.Date)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Income>> CreateIncome(CreateIncomeDto dto)
    {
        var income = new Income
        {
            Title = dto.Title,
            Amount = dto.Amount,
            Category = dto.Category,
            ReceivedByUserId = dto.ReceivedByUserId,
            Date = dto.Date ?? DateTime.UtcNow
        };

        _context.Incomes.Add(income);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetIncomes), new { id = income.Id }, income);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIncome(int id)
    {
        var income = await _context.Incomes.FindAsync(id);
        if (income == null)
            return NotFound();

        _context.Incomes.Remove(income);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateIncomeDto(
    string Title,
    decimal Amount,
    string Category = "salario",
    int ReceivedByUserId = 1,
    DateTime? Date = null
);

[ApiController]
[Route("api/[controller]")]
public class DebtsController : ControllerBase
{
    private readonly EixoDbContext _context;

    public DebtsController(EixoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Debt>>> GetDebts()
    {
        return await _context.Debts
            .Include(d => d.Owner)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Debt>> CreateDebt(CreateDebtDto dto)
    {
        var debt = new Debt
        {
            Title = dto.Title,
            Description = dto.Description,
            TotalAmount = dto.TotalAmount,
            InstallmentAmount = dto.InstallmentAmount,
            TotalInstallments = dto.TotalInstallments,
            DueDateDay = dto.DueDateDay,
            OwnerUserId = dto.OwnerUserId
        };

        _context.Debts.Add(debt);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetDebts), new { id = debt.Id }, debt);
    }

    [HttpPost("{id}/pay")]
    public async Task<IActionResult> PayInstallment(int id)
    {
        var debt = await _context.Debts.FindAsync(id);
        if (debt == null)
            return NotFound();

        if (debt.PaidInstallments >= debt.TotalInstallments)
            return BadRequest("All installments already paid");

        debt.PaidInstallments++;
        await _context.SaveChangesAsync();

        return Ok(new { 
            paidInstallments = debt.PaidInstallments, 
            remaining = debt.TotalInstallments - debt.PaidInstallments 
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDebt(int id)
    {
        var debt = await _context.Debts.FindAsync(id);
        if (debt == null)
            return NotFound();

        _context.Debts.Remove(debt);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateDebtDto(
    string Title,
    decimal TotalAmount,
    decimal InstallmentAmount,
    int TotalInstallments,
    int DueDateDay = 10,
    int OwnerUserId = 1,
    string? Description = null
);

[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly EixoDbContext _context;

    public SubscriptionsController(EixoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Subscription>>> GetSubscriptions()
    {
        return await _context.Subscriptions.Where(s => s.IsActive).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Subscription>> CreateSubscription(CreateSubscriptionDto dto)
    {
        var sub = new Subscription
        {
            Title = dto.Title,
            Amount = dto.Amount,
            DueDateDay = dto.DueDateDay,
            Category = dto.Category
        };

        _context.Subscriptions.Add(sub);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetSubscriptions), new { id = sub.Id }, sub);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSubscription(int id)
    {
        var sub = await _context.Subscriptions.FindAsync(id);
        if (sub == null)
            return NotFound();

        sub.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateSubscriptionDto(
    string Title,
    decimal Amount,
    int DueDateDay = 1,
    string Category = "outro"
);

[ApiController]
[Route("api/[controller]")]
public class GoalsController : ControllerBase
{
    private readonly EixoDbContext _context;
    private readonly INotificationService _notifications;

    public GoalsController(EixoDbContext context, INotificationService notifications)
    {
        _context = context;
        _notifications = notifications;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Goal>>> GetGoals()
    {
        return await _context.Goals
            .Include(g => g.Contributions)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Goal>> CreateGoal(CreateGoalDto dto)
    {
        var goal = new Goal
        {
            Title = dto.Title,
            Description = dto.Description,
            TargetAmount = dto.TargetAmount,
            Deadline = dto.Deadline,
            Type = dto.Type,
            Unit = dto.Unit
        };

        _context.Goals.Add(goal);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetGoals), new { id = goal.Id }, goal);
    }

    [HttpPost("{id}/contribute")]
    public async Task<IActionResult> AddContribution(int id, [FromBody] ContributeDto dto)
    {
        var goal = await _context.Goals.FindAsync(id);
        if (goal == null)
            return NotFound();

        goal.CurrentAmount += dto.Amount;
        
        _context.GoalContributions.Add(new GoalContribution
        {
            GoalId = id,
            Amount = dto.Amount,
            Note = dto.Note
        });

        await _context.SaveChangesAsync();

        // Broadcast real-time notification
        await _notifications.NotifyGoalProgress(goal.Title, goal.CurrentAmount, goal.TargetAmount);

        return Ok(new { currentAmount = goal.CurrentAmount, progress = goal.CurrentAmount / goal.TargetAmount * 100 });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGoal(int id)
    {
        var goal = await _context.Goals.FindAsync(id);
        if (goal == null)
            return NotFound();

        _context.Goals.Remove(goal);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public record CreateGoalDto(
    string Title,
    string Description,
    decimal TargetAmount,
    DateTime? Deadline = null,
    string Type = "finance",
    string Unit = "R$"
);

public record ContributeDto(decimal Amount, string? Note = null);
