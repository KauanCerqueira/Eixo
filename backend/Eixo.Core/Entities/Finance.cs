namespace Eixo.Core.Entities;

public class Expense
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Category { get; set; } = "outros"; // moradia, alimentacao, lazer, transporte, outros
    public int PaidByUserId { get; set; }
    public User PaidBy { get; set; } = null!;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<ExpenseSplit> Splits { get; set; } = new List<ExpenseSplit>();
}

public class ExpenseSplit
{
    public int Id { get; set; }
    public int ExpenseId { get; set; }
    public Expense Expense { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public decimal ShareAmount { get; set; }
}

public class Income
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Category { get; set; } = "salario"; // salario, extra, investimento, venda
    public int ReceivedByUserId { get; set; }
    public User ReceivedBy { get; set; } = null!;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Debt
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal InstallmentAmount { get; set; }
    public int TotalInstallments { get; set; }
    public int PaidInstallments { get; set; } = 0;
    public int DueDateDay { get; set; } = 10;
    public int OwnerUserId { get; set; }
    public User Owner { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Subscription
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public int DueDateDay { get; set; } = 1;
    public string Category { get; set; } = "outro"; // streaming, servico, utilidade, outro
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Goal
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; } = 0;
    public DateTime? Deadline { get; set; }
    public string Type { get; set; } = "finance"; // finance, general
    public string Unit { get; set; } = "R$";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public ICollection<GoalContribution> Contributions { get; set; } = new List<GoalContribution>();
}

public class GoalContribution
{
    public int Id { get; set; }
    public int GoalId { get; set; }
    public Goal Goal { get; set; } = null!;
    public decimal Amount { get; set; }
    public string? Note { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow;
}
