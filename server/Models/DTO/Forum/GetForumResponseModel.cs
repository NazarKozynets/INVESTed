using server.Models.Forum;
using server.Models.Idea;

namespace server.Models.DTO.Forum;

public class GetForumResponseModel
{
    public string ForumId { get; set; }
    public string ForumTitle { get; set; }
    public string ForumDescription { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool CanEdit { get; set; }
    public bool IsClosed { get; set; }
    public List<ForumCommentModel> Comments { get; set; }
    public string? CreatorUsername { get; set; }

    public GetForumResponseModel(
        string forumId,
        string forumTitle,
        string forumDescription,
        DateTime createdAt,
        bool canEdit = false,
        bool isClosed = false,
        List<ForumCommentModel>? comments = null,
        string? creatorUsername = null)
    {
        ForumId = forumId;
        ForumTitle = forumTitle;
        ForumDescription = forumDescription;
        CreatedAt = createdAt;
        CanEdit = canEdit;
        IsClosed = isClosed;
        Comments = comments ?? new List<ForumCommentModel>();
        CreatorUsername = creatorUsername;
    }
}