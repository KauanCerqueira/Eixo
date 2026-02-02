namespace Eixo.Core.Entities;

public class Reward
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public int Cost { get; set; }
    public string Icon { get; set; } = "🎁";
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class RewardRedemption
{
    public int Id { get; set; }
    public int RewardId { get; set; }
    public Reward Reward { get; set; } = null!;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public int PointsSpent { get; set; }
    public DateTime RedeemedAt { get; set; } = DateTime.UtcNow;
}
