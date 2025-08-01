using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using server.Models.Idea;

namespace server.Models.Forum;

public enum ForumStatus
{
    Open = 0,
    Closed = 1
}

public class ForumCommentModel : IdeaCommentModel
{
    [BsonElement("isHelpful")]
    public bool IsHelpful { get; private set; } = false;

    public ForumCommentModel(string commentText, string commentatorId)
        : base(commentText, commentatorId)
    {
    }

    public void MarkAsHelpful()
    {
        IsHelpful = true;
    }

    public void UnmarkAsHelpful()
    {
        IsHelpful = false;
    }
}

public class ForumModel
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; private set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("creatorId")]
    public string CreatorId { get; private set; }

    [BsonElement("title")]
    public string Title { get; private set; }

    [BsonElement("description")]
    public string Description { get; private set; }
    
    [BsonElement("imageUrl")]
    public string? ImageUrl { get; private set; }

    [BsonElement("status")]
    public ForumStatus Status { get; private set; } = ForumStatus.Open;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;

    [BsonElement("comments")]
    public List<ForumCommentModel> Comments { get; private set; } = new List<ForumCommentModel>();

    [BsonIgnore] public string? CreatorUsername { get; set; }
    [BsonIgnore] public string? CreatorAvatarUrl { get; set; }

    public ForumModel(string creatorId, string title, string description, string? imageUrl = null)
    {
        if (string.IsNullOrWhiteSpace(creatorId)) throw new ArgumentException("INVALID_CREATOR_ID");
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("INVALID_TITLE");
        if (string.IsNullOrWhiteSpace(description)) throw new ArgumentException("INVALID_DESCRIPTION");

        CreatorId = creatorId;
        Title = title;
        Description = description;
        ImageUrl = imageUrl;
    }

    public ForumCommentModel AddComment(string commentText, string commentatorId)
    {
        ForumCommentModel commentModel = new ForumCommentModel(commentText, commentatorId);
        Comments.Add(commentModel);
        return commentModel;
    }

    public void CloseForum()
    {
        Status = ForumStatus.Closed;
    }

    public void ReopenForum()
    {
        Status = ForumStatus.Open;
    }
}