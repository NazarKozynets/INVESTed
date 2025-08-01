namespace server.Models.DTO.Profile;

public class GetUserProfileModel
{
    public string UserId { get; set; }
    public string Username { get; set; }
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public double? AverageIdeaRating { get; set; }
    public int? TotalIdeasAmount { get; set; }
    public decimal? TotalFunding { get; set; }
    public int? TotalForumsAmount { get; set; }
    public int? TotalClosedForumsAmount { get; set; }
    public bool CanEdit { get; set; }
}