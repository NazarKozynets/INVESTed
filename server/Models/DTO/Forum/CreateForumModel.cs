namespace server.Models.DTO.Forum;

public class CreateForumModel
{
    public string ForumTitle { get; set; }
    public string ForumDescription { get; set; }
    public string? ForumImageUrl { get; set; }
    public string? CreatorId { get; set; }
    
    //added for logs 
    public override string ToString()
    {
        return $"ForumTitle: {ForumTitle}, ForumDescription: {ForumDescription}";
    }
}