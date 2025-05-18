using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Security.Claims;

namespace server.Models.Idea;

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
        if (newRate < 0 || newRate > 5)
            throw new ArgumentException("Rating needs to be between 0 and 5.");
        Rate = newRate;
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

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; private set; }

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

    public void AddRating(string ratedBy, int rating)
    {
        var ratingModel = new IdeaRatingModel(ratedBy, rating);
        Rating.Add(ratingModel);
    }

    public void UpdateRating(string ratedBy, int newRating)
    {
        var existingRating = Rating.FirstOrDefault(r => r.RatedBy == ratedBy);
        if (existingRating != null)
        {
            existingRating.UpdateRate(newRating);
        }
        else
        {
            AddRating(ratedBy, newRating);
        }
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
}