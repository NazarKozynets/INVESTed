namespace server.Models.DTO.Idea;

public class StartIdeaModel
{
    public string IdeaName { get; set; }
    public string IdeaDescription { get; set; }
    public int TargetAmount { get; set; }
    public DateTime FundingDeadline { get; set; }
    public string? CreatorId { get; set; }
}