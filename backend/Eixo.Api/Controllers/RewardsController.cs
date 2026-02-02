using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Eixo.Core.Entities;
using Eixo.Infrastructure.Data;
using Eixo.Api.Hubs;

namespace Eixo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RewardsController : ControllerBase
{
    private readonly EixoDbContext _context;
    private readonly INotificationService _notifications;

    public RewardsController(EixoDbContext context, INotificationService notifications)
    {
        _context = context;
        _notifications = notifications;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Reward>>> GetRewards()
    {
        return await _context.Rewards.Where(r => r.IsActive).ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Reward>> CreateReward(CreateRewardDto dto)
    {
        var reward = new Reward
        {
            Title = dto.Title,
            Cost = dto.Cost,
            Icon = dto.Icon,
            Description = dto.Description
        };

        _context.Rewards.Add(reward);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRewards), new { id = reward.Id }, reward);
    }

    [HttpPost("{id}/redeem")]
    public async Task<IActionResult> RedeemReward(int id, [FromBody] RedeemDto dto)
    {
        var reward = await _context.Rewards.FindAsync(id);
        if (reward == null)
            return NotFound("Reward not found");

        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null)
            return NotFound("User not found");

        if (user.Points < reward.Cost)
            return BadRequest("Insufficient points");

        // Deduct points
        user.Points -= reward.Cost;

        // Record redemption
        _context.RewardRedemptions.Add(new RewardRedemption
        {
            RewardId = id,
            UserId = dto.UserId,
            PointsSpent = reward.Cost
        });

        // Create notification
        _context.Notifications.Add(new Notification
        {
            Title = "Recompensa Resgatada! 🎉",
            Message = $"{user.Name} resgatou: {reward.Title}",
            Type = "achievement"
        });

        await _context.SaveChangesAsync();

        // Broadcast real-time notification
        await _notifications.NotifyRewardRedeemed(user.Name, reward.Title);

        return Ok(new { 
            remainingPoints = user.Points, 
            message = $"Successfully redeemed {reward.Title}" 
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReward(int id)
    {
        var reward = await _context.Rewards.FindAsync(id);
        if (reward == null)
            return NotFound();

        reward.IsActive = false;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("history/{userId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetRedemptionHistory(int userId)
    {
        return await _context.RewardRedemptions
            .Where(r => r.UserId == userId)
            .Include(r => r.Reward)
            .OrderByDescending(r => r.RedeemedAt)
            .Select(r => new 
            { 
                r.Id, 
                r.RedeemedAt, 
                r.PointsSpent, 
                RewardTitle = r.Reward.Title,
                RewardIcon = r.Reward.Icon
            })
            .ToListAsync();
    }
}

public record CreateRewardDto(string Title, int Cost, string Icon = "🎁", string? Description = null);
public record RedeemDto(int UserId);
