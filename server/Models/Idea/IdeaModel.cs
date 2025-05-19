using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Security.Claims;

namespace server.Models.Idea;

public enum IdeaStatus
{
    Open,
    Closed,
}

public class IdeaRatingModel
{
    [BsonElement("ratedBy")]
    public string RatedBy { get; init; }

    [BsonElement("rate")]
    public int Rate { get; private set; }

    public IdeaRatingModel(string ratedBy, int rate)
    {
        RatedBy = ratedBy;
        UpdateRate(rate);
    }

    public void UpdateRate(int newRate)
    {
        Rate = newRate;
    }
}

public class IdeaCommentModel
{
    [BsonElement("commentText")]
    public string CommentText { get; private set; }

    [BsonElement("commentedBy")]
    public string CommentedBy { get; init; }

    [BsonElement("commentDate")]
    public DateTime CommentDate { get; init; }

    [BsonElement("replies")]
    public List<IdeaCommentModel> Replies { get; private set; } = new List<IdeaCommentModel>();

    public IdeaCommentModel(string commentText, string commentedBy)
    {
        if (string.IsNullOrWhiteSpace(commentText))
            throw new ArgumentException("Comment text cannot be empty.");
        if (string.IsNullOrWhiteSpace(commentedBy))
            throw new ArgumentException("CommentedBy cannot be empty.");

        CommentText = commentText;
        CommentedBy = commentedBy;
        CommentDate = DateTime.UtcNow;
    }

    public void UpdateCommentText(string newText)
    {
        if (string.IsNullOrWhiteSpace(newText))
            throw new ArgumentException("Comment text cannot be empty.");
        CommentText = newText;
    }

    public void AddReply(IdeaCommentModel reply)
    {
        if (reply == null)
            throw new ArgumentNullException(nameof(reply));
        Replies.Add(reply);
    }
}

public class IdeaModel
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; private set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("creatorId")]
    public string CreatorId { get; init; }

    [BsonElement("ideaName")]
    public string IdeaName { get; private set; }

    [BsonElement("ideaDescription")]
    public string IdeaDescription { get; private set; }

    [BsonElement("targetAmount")]
    public int TargetAmount { get; private set; }

    [BsonElement("alreadyCollected")]
    public int AlreadyCollected { get; private set; } = 0;

    [BsonElement("fundingDeadline")]
    public DateTime FundingDeadline { get; private set; }

    [BsonElement("rating")]
    public List<IdeaRatingModel> Rating { get; private set; } = new List<IdeaRatingModel>();

    [BsonElement("comments")]
    public List<IdeaCommentModel> Comments { get; private set; } = new List<IdeaCommentModel>();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; private set; }
    
    [BsonElement("status")]
    public IdeaStatus Status { get; private set; } = IdeaStatus.Open;

    [BsonIgnore]
    public string? CreatorUsername { get; set; }

    public IdeaModel(string creatorId, string ideaName, string ideaDescription, int targetAmount, DateTime fundingDeadline)
    {
        if (string.IsNullOrWhiteSpace(creatorId))
            throw new ArgumentException("Creator ID cannot be empty.");
        if (string.IsNullOrWhiteSpace(ideaName))
            throw new ArgumentException("Idea name cannot be empty.");
        if (string.IsNullOrWhiteSpace(ideaDescription))
            throw new ArgumentException("Idea description cannot be empty.");
        if (targetAmount <= 0)
            throw new ArgumentException("Target amount must be positive.");
        if (fundingDeadline <= DateTime.UtcNow)
            throw new ArgumentException("Funding deadline must be in the future.");

        CreatorId = creatorId;
        IdeaName = ideaName;
        IdeaDescription = ideaDescription;
        TargetAmount = targetAmount;
        FundingDeadline = fundingDeadline;
        CreatedAt = DateTime.UtcNow;
        Status = IdeaStatus.Open;
        Rating = new List<IdeaRatingModel>();
        Comments = new List<IdeaCommentModel>();
    }

    public void UpdateIdeaName(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new ArgumentException("Idea name cannot be empty.");
        IdeaName = newName;
    }

    public void UpdateIdeaDescription(string newDescription)
    {
        if (string.IsNullOrWhiteSpace(newDescription))
            throw new ArgumentException("Idea description cannot be empty.");
        IdeaDescription = newDescription;
    }

    public void UpdateTargetAmount(int newAmount)
    {
        if (newAmount <= 0)
            throw new ArgumentException("Target amount must be positive.");
        TargetAmount = newAmount;
    }

    public void UpdateFundingDeadline(DateTime newDeadline)
    {
        if (newDeadline <= DateTime.UtcNow)
            throw new ArgumentException("Funding deadline must be in the future.");
        FundingDeadline = newDeadline;
    }

    public void UpdateAlreadyCollected(int amount)
    {
        if (amount < 0)
            throw new ArgumentException("Collected amount cannot be negative.");
        if (amount > TargetAmount)
            throw new ArgumentException("Collected amount cannot exceed target amount.");
        AlreadyCollected = amount;
    }
    
    public void CloseIdea()
    {
        if (Status != IdeaStatus.Open)
            throw new InvalidOperationException("Idea is not open.");
        Status = IdeaStatus.Closed;
    }
    
    public bool IsFundingExpired()
    {
        return FundingDeadline <= DateTime.UtcNow;
    }

    public IdeaRatingModel AddRating(string ratedBy, int rating)
    {
        var ratingModel = new IdeaRatingModel(ratedBy, rating);
        Rating.Add(ratingModel);
        return ratingModel;
    }

    public double GetAverageRating()
    {
        double avg = (Rating.Count > 0)
            ? Rating.Average(r => r.Rate)
            : 0;

        if (avg > 5) avg = 5.0;
        if (avg < 0) avg = 0.0;

        return avg;
    }

    public IdeaCommentModel AddComment(string commentText, string commentedBy)
    {
        var commentModel = new IdeaCommentModel(commentText, commentedBy);
        Comments.Add(commentModel);
        return commentModel;
    }

    public void ReplyToComment(string parentCommentText, string replyText, string commentedBy)
    {
        if (string.IsNullOrWhiteSpace(parentCommentText))
            throw new ArgumentException("Parent comment text cannot be empty.");
        if (string.IsNullOrWhiteSpace(replyText))
            throw new ArgumentException("Reply text cannot be empty.");
        if (string.IsNullOrWhiteSpace(commentedBy))
            throw new ArgumentException("CommentedBy cannot be empty.");

        var parentComment = Comments.FirstOrDefault(c => c.CommentText == parentCommentText);
        if (parentComment == null)
            throw new ArgumentException("Parent comment not found.");

        var reply = new IdeaCommentModel(replyText, commentedBy);
        parentComment.AddReply(reply);
    }

    public void UpdateComment(string oldCommentText, string newCommentText, string commentedBy)
    {
        if (string.IsNullOrWhiteSpace(oldCommentText))
            throw new ArgumentException("Old comment text cannot be empty.");
        if (string.IsNullOrWhiteSpace(newCommentText))
            throw new ArgumentException("New comment text cannot be empty.");
        if (string.IsNullOrWhiteSpace(commentedBy))
            throw new ArgumentException("CommentedBy cannot be empty.");

        var comment = Comments.FirstOrDefault(c => c.CommentText == oldCommentText && c.CommentedBy == commentedBy);
        if (comment == null)
            throw new ArgumentException("Comment not found or not authored by this user.");

        comment.UpdateCommentText(newCommentText);
    }
}