namespace server.Models.DTO.Forum;

public class SearchForumModel
{
    public string Id { get; set; }
    public string ForumTitle { get; set; }
    public string CreatorId { get; set; }
    public string CreatorUsername { get; set; }
    public string? CreatorAvatarUrl { get; set; }
}