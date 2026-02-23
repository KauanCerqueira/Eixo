using Microsoft.AspNetCore.SignalR;
using Eixo.Api.Services;
using System.Collections.Concurrent;

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
    Task NotifyTaskCompleted(int taskId, string taskTitle, string userName, int pointsEarned, int actorUserId);
    Task NotifyRewardRedeemed(string userName, string rewardTitle, int actorUserId);
    Task NotifyNewExpense(string title, decimal amount, string paidBy, int actorUserId);
    Task NotifyGoalProgress(string goalTitle, decimal currentAmount, decimal targetAmount, int actorUserId);
    Task NotifyShoppingItemAdded(string itemName, string addedBy, int actorUserId);
    Task NotifyNewNotice(string text, string author, int authorId);
    Task NotifyUserDirect(int userId, string title, string message, string type);
}

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly IPushNotificationService _pushNotifications;
    private static readonly ConcurrentDictionary<string, DateTime> RecentEvents = new();

    public NotificationService(IHubContext<NotificationHub> hubContext, IPushNotificationService pushNotifications)
    {
        _hubContext = hubContext;
        _pushNotifications = pushNotifications;
    }

    public async Task NotifyTaskCompleted(int taskId, string taskTitle, string userName, int pointsEarned, int actorUserId)
    {
        if (IsDuplicate($"task:{actorUserId}:{taskId}:{pointsEarned}")) return;

        var payload = new
        {
            taskId,
            taskTitle,
            userName,
            pointsEarned,
            message = $"🎯 {userName} completou: {taskTitle} (+{pointsEarned} pts)",
            timestamp = DateTime.UtcNow
        };

        await _hubContext.Clients.Group("family").SendAsync("TaskCompleted", new
        {
            payload.taskId,
            payload.taskTitle,
            payload.userName,
            payload.pointsEarned,
            actorUserId,
            payload.message,
            payload.timestamp
        });

        await _pushNotifications.SendToFamilyExceptAsync(
            actorUserId,
            "Tarefa concluída",
            payload.message,
            new { type = "TaskCompleted", taskId, pointsEarned });
    }

    public async Task NotifyRewardRedeemed(string userName, string rewardTitle, int actorUserId)
    {
        if (IsDuplicate($"reward:{actorUserId}:{rewardTitle}")) return;

        var message = $"🎁 {userName} resgatou: {rewardTitle}";
        await _hubContext.Clients.Group("family").SendAsync("RewardRedeemed", new
        {
            userName,
            rewardTitle,
            actorUserId,
            message,
            timestamp = DateTime.UtcNow
        });

        await _pushNotifications.SendToFamilyExceptAsync(
            actorUserId,
            "Recompensa resgatada",
            message,
            new { type = "RewardRedeemed", rewardTitle });
    }

    public async Task NotifyNewExpense(string title, decimal amount, string paidBy, int actorUserId)
    {
        if (IsDuplicate($"expense:{actorUserId}:{title}:{amount}")) return;

        var message = $"💸 {paidBy} registrou gasto: {title} (R$ {amount:N2})";
        await _hubContext.Clients.Group("family").SendAsync("NewExpense", new
        {
            title,
            amount,
            paidBy,
            actorUserId,
            message,
            timestamp = DateTime.UtcNow
        });

        await _pushNotifications.SendToFamilyExceptAsync(
            actorUserId,
            "Nova despesa da família",
            message,
            new { type = "NewExpense", amount });
    }

    public async Task NotifyGoalProgress(string goalTitle, decimal currentAmount, decimal targetAmount, int actorUserId)
    {
        if (IsDuplicate($"goal:{actorUserId}:{goalTitle}:{currentAmount}")) return;

        var progress = (currentAmount / targetAmount) * 100;
        var message = $"🎯 Meta '{goalTitle}': {progress:N0}% concluída!";
        await _hubContext.Clients.Group("family").SendAsync("GoalProgress", new
        {
            goalTitle,
            currentAmount,
            targetAmount,
            progress,
            actorUserId,
            message,
            timestamp = DateTime.UtcNow
        });

        await _pushNotifications.SendToFamilyExceptAsync(
            actorUserId,
            "Atualização de meta",
            message,
            new { type = "GoalProgress", progress });
    }

    public async Task NotifyShoppingItemAdded(string itemName, string addedBy, int actorUserId)
    {
        if (IsDuplicate($"shopping:{actorUserId}:{itemName}")) return;

        var message = $"🛒 {addedBy} adicionou à lista: {itemName}";
        await _hubContext.Clients.Group("family").SendAsync("ShoppingItemAdded", new
        {
            itemName,
            addedBy,
            actorUserId,
            message,
            timestamp = DateTime.UtcNow
        });

        await _pushNotifications.SendToFamilyExceptAsync(
            actorUserId,
            "Lista de compras",
            message,
            new { type = "ShoppingItemAdded", itemName });
    }

    public async Task NotifyNewNotice(string text, string author, int authorId)
    {
        if (IsDuplicate($"notice:{authorId}:{text}", windowSeconds: 20)) return;

        var message = $"📢 {author}: {text}";
        await _hubContext.Clients.Group("family").SendAsync("NewNotice", new
        {
            text,
            author,
            authorId,
            message,
            timestamp = DateTime.UtcNow
        });

        await _pushNotifications.SendToFamilyExceptAsync(
            authorId,
            $"Aviso de {author}",
            text,
            new { type = "NewNotice" });
    }

    public async Task NotifyUserDirect(int userId, string title, string message, string type)
    {
        if (IsDuplicate($"direct:{userId}:{type}:{title}:{message}")) return;

        await _hubContext.Clients.Group($"user-{userId}").SendAsync("DirectNotification", new
        {
            title,
            message,
            type,
            timestamp = DateTime.UtcNow
        });

        await _pushNotifications.SendToUsersAsync(
            [userId],
            title,
            message,
            new { type = "DirectNotification", category = type });
    }

    private static bool IsDuplicate(string key, int windowSeconds = 5)
    {
        var now = DateTime.UtcNow;
        if (RecentEvents.TryGetValue(key, out var lastSeen))
        {
            if ((now - lastSeen).TotalSeconds < windowSeconds)
                return true;
        }

        RecentEvents[key] = now;

        if (RecentEvents.Count > 1500)
        {
            var threshold = now.AddMinutes(-10);
            foreach (var entry in RecentEvents)
            {
                if (entry.Value < threshold)
                {
                    RecentEvents.TryRemove(entry.Key, out _);
                }
            }
        }

        return false;
    }
}
