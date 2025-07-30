namespace server.Models.DTO.Idea;

public class SearchIdeaModel
{
    public string Id { get; set; }
    public string IdeaName { get; set; }
    public string CreatorId { get; set; }
    public string CreatorUsername { get; set; }
    public string? CreatorAvatarUrl { get; set; }
}