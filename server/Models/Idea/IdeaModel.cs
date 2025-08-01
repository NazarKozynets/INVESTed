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
    [BsonElement("ratedBy")] public string RatedBy { get; init; }

    [BsonElement("rate")] public int Rate { get; private set; }

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
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; private set; } = ObjectId.GenerateNewId().ToString();
    
    [BsonElement("commentText")] public string CommentText { get; private set; }

    [BsonElement("commentatorId")] public string CommentatorId { get; init; }

    [BsonElement("commentDate")] public DateTime CommentDate { get; init; }
    
    [BsonIgnore] public string? CommentatorUsername { get; set; }
    [BsonIgnore] public string? CommentatorAvatarUrl { get; set; }

    public IdeaCommentModel(string commentText, string commentatorId)
    {
        if (string.IsNullOrWhiteSpace(commentText))
            throw new ArgumentException("Comment text cannot be empty.");
        if (string.IsNullOrWhiteSpace(commentatorId))
            throw new ArgumentException("CommentatorId cannot be empty.");

        CommentText = commentText;
        CommentatorId = commentatorId;
        CommentDate = DateTime.UtcNow;
    }
}

public class IdeaFundingHistoryElementModel
{
    [BsonElement("fundedById")] public string FundedById { get; init; }

    [BsonElement("fundedByUsername")] public string FundedByUsername { get; init; }

    [BsonElement("fundedDate")] public DateTime FundedDate { get; init; }

    [BsonElement("fundingAmount")] public decimal FundingAmount { get; init; }

    public IdeaFundingHistoryElementModel(string fundedById, string fundedByUsername, decimal fundingAmount)
    {
        if (string.IsNullOrWhiteSpace(fundedById))
            throw new ArgumentException("FundedById cannot be empty.");
        if (string.IsNullOrWhiteSpace(fundedByUsername))
            throw new ArgumentException("FundedByUsername cannot be empty.");
        if (fundingAmount <= 0 || fundingAmount > 1000000m)
            throw new ArgumentException("FundingAmount must be a positive and reasonable number.");

        FundedById = fundedById;
        FundedByUsername = fundedByUsername;
        FundingAmount = fundingAmount;
        FundedDate = DateTime.UtcNow;
    }
}

public class IdeaModel
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; private set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("creatorId")] public string CreatorId { get; init; }

    [BsonElement("ideaName")] public string IdeaName { get; private set; }

    [BsonElement("ideaDescription")] public string IdeaDescription { get; private set; }

    [BsonElement("targetAmount")] public decimal TargetAmount { get; private set; }

    [BsonElement("alreadyCollected")] public decimal AlreadyCollected { get; private set; } = 0;

    [BsonElement("fundingDeadline")] public DateTime FundingDeadline { get; private set; }

    [BsonElement("rating")] public List<IdeaRatingModel> Rating { get; private set; } = new List<IdeaRatingModel>();

    [BsonElement("comments")]
    public List<IdeaCommentModel> Comments { get; private set; } = new List<IdeaCommentModel>();

    [BsonElement("fundingHistory")]
    public List<IdeaFundingHistoryElementModel> FundingHistory { get; private set; } =
        new List<IdeaFundingHistoryElementModel>();

    [BsonElement("createdAt")] public DateTime CreatedAt { get; private set; }

    [BsonElement("status")] public IdeaStatus Status { get; private set; } = IdeaStatus.Open;

    [BsonIgnore] public string? CreatorUsername { get; set; }
    [BsonIgnore] public string? CreatorAvatarUrl { get; set; }

    public IdeaModel(string creatorId, string ideaName, string ideaDescription, decimal targetAmount,
        DateTime fundingDeadline)
    {
        if (string.IsNullOrWhiteSpace(creatorId))
            throw new ArgumentException("Creator ID cannot be empty.");
        if (string.IsNullOrWhiteSpace(ideaName))
            throw new ArgumentException("Idea name cannot be empty.");
        if (string.IsNullOrWhiteSpace(ideaDescription))
            throw new ArgumentException("Idea description cannot be empty.");
        if (targetAmount <= 0 || targetAmount > 1000000m)
            throw new ArgumentException("Target amount must be positive and reasonable number.");
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

    public void UpdateAlreadyCollected(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Target amount must be positive.");
        if (amount > TargetAmount)
            throw new ArgumentException("Collected amount cannot exceed target amount.");
        AlreadyCollected += amount;
    }

    public void CloseIdea()
    {
        if (Status != IdeaStatus.Open)
            throw new InvalidOperationException("Idea is not open.");
        Status = IdeaStatus.Closed;
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

    public IdeaCommentModel AddComment(string commentText, string commentatorId)
    {
        IdeaCommentModel commentModel = new IdeaCommentModel(commentText, commentatorId);
        Comments.Add(commentModel);
        return commentModel;
    }

    public bool DeleteComment(string commentId)
    {
        var commentToRemove = Comments.FirstOrDefault(c => c.Id == commentId);
        if (commentToRemove == null)
            return false; 

        return Comments.Remove(commentToRemove);
    }
    
    public (decimal, IdeaFundingHistoryElementModel fundingHistoryElementModel) AddElementToFundingHistory(string fundedById, string fundedByUsername,
        decimal fundingAmount)
    {
        IdeaFundingHistoryElementModel fundingHistoryElementModel =
            new IdeaFundingHistoryElementModel(fundedById, fundedByUsername, fundingAmount);
        FundingHistory.Add(fundingHistoryElementModel);
        UpdateAlreadyCollected(fundingAmount);
        return (AlreadyCollected, fundingHistoryElementModel);
    }
}