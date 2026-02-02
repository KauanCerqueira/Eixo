using Microsoft.AspNetCore.SignalR;

namespace Eixo.Api.Hubs;

/// <summary>
/// SignalR Hub for real-time family notifications
/// </summary>
public class NotificationHub : Hub
{
    /// <summary>
    /// Called when a client connects
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        // Add to family group (for now all users are in one family)
        await Groups.AddToGroupAsync(Context.ConnectionId, "family");
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Join a specific user's personal channel
    /// </summary>
    public async Task JoinUserChannel(int userId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
    }

    /// <summary>
    /// Leave a user's personal channel
    /// </summary>
    public async Task LeaveUserChannel(int userId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId}");
    }
}

/// <summary>
/// Service for broadcasting notifications
/// </summary>
public interface INotificationService
{
    Task NotifyTaskCompleted(int taskId, string taskTitle, string userName, int pointsEarned);
    Task NotifyRewardRedeemed(string userName, string rewardTitle);
    Task NotifyNewExpense(string title, decimal amount, string paidBy);
    Task NotifyGoalProgress(string goalTitle, decimal currentAmount, decimal targetAmount);
    Task NotifyShoppingItemAdded(string itemName, string addedBy);
    Task NotifyNewNotice(string text, string author);
    Task NotifyUserDirect(int userId, string title, string message, string type);
}

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyTaskCompleted(int taskId, string taskTitle, string userName, int pointsEarned)
    {
        await _hubContext.Clients.Group("family").SendAsync("TaskCompleted", new
        {
            taskId,
            taskTitle,
            userName,
            pointsEarned,
            message = $"🎯 {userName} completou: {taskTitle} (+{pointsEarned} pts)",
            timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyRewardRedeemed(string userName, string rewardTitle)
    {
        await _hubContext.Clients.Group("family").SendAsync("RewardRedeemed", new
        {
            userName,
            rewardTitle,
            message = $"🎁 {userName} resgatou: {rewardTitle}",
            timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyNewExpense(string title, decimal amount, string paidBy)
    {
        await _hubContext.Clients.Group("family").SendAsync("NewExpense", new
        {
            title,
            amount,
            paidBy,
            message = $"💸 {paidBy} registrou gasto: {title} (R$ {amount:N2})",
            timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyGoalProgress(string goalTitle, decimal currentAmount, decimal targetAmount)
    {
        var progress = (currentAmount / targetAmount) * 100;
        await _hubContext.Clients.Group("family").SendAsync("GoalProgress", new
        {
            goalTitle,
            currentAmount,
            targetAmount,
            progress,
            message = $"🎯 Meta '{goalTitle}': {progress:N0}% concluída!",
            timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyShoppingItemAdded(string itemName, string addedBy)
    {
        await _hubContext.Clients.Group("family").SendAsync("ShoppingItemAdded", new
        {
            itemName,
            addedBy,
            message = $"🛒 {addedBy} adicionou à lista: {itemName}",
            timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyNewNotice(string text, string author)
    {
        await _hubContext.Clients.Group("family").SendAsync("NewNotice", new
        {
            text,
            author,
            message = $"📢 {author}: {text}",
            timestamp = DateTime.UtcNow
        });
    }

    public async Task NotifyUserDirect(int userId, string title, string message, string type)
    {
        await _hubContext.Clients.Group($"user-{userId}").SendAsync("DirectNotification", new
        {
            title,
            message,
            type,
            timestamp = DateTime.UtcNow
        });
    }
}
