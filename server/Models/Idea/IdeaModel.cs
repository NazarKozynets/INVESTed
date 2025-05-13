using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace server.Models.Idea;

public class IdeaModel
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; private set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("creatorId")]
    public string CreatorId { get; set; }

    [BsonElement("ideaName")]
    public string IdeaName { get; set; }

    [BsonElement("ideaDescription")]
    public string IdeaDescription { get; set; }

    [BsonElement("targetAmount")]
    public int TargetAmount { get; set; }
    
    [BsonElement("alreadyCollected")]
    public int AlreadyCollected { get; private set; } = 0; 

    [BsonElement("fundingDeadline")]
    public DateTime FundingDeadline { get; set; }
    
    [BsonElement("rating")]
    public double Rating { get; private set; } = 0.0; 
    
    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; private set; }

    [BsonIgnore] //mongodb wont save this 
    public string? CreatorUsername { get; set; }
    
    public IdeaModel(string creatorId, string ideaName, string ideaDescription, int targetAmount, DateTime fundingDeadline)
    {
        CreatorId = creatorId;
        IdeaName = ideaName;
        IdeaDescription = ideaDescription;
        TargetAmount = targetAmount;
        FundingDeadline = fundingDeadline;
        CreatedAt = DateTime.UtcNow;
    }
}