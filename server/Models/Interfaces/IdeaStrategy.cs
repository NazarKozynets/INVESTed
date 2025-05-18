using MongoDB.Bson.Serialization.Attributes;
using server.Models.DTO.Idea;
using server.Models.Idea;
using server.Services.Idea;

namespace server.Models.Interfaces;

public abstract class IdeaStrategy
{
    //create abstractt class instead of interface so I can make some methods optional 
    public virtual IdeaModel StartIdea(StartIdeaModel ideaData, string creatorId)
    {
        return null;
    }

    public virtual IEnumerable<GetIdeaResponseModel> GetAllUserIdeas(IEnumerable<IdeaModel> ideas,
        bool? isOwner)
    {
        return ideas.Select(idea => new GetIdeaResponseModel(
            ideaId: idea.Id,
            idea.IdeaName,
            idea.IdeaDescription,
            idea.TargetAmount,
            idea.AlreadyCollected,
            idea.FundingDeadline,
            idea.Rating,
            idea.GetAverageRating(),
            canEdit: true
        ));
    }

    public IEnumerable<GetIdeaResponseModel> GetFormattedIdeas(IEnumerable<IdeaModel> ideas)
    {
        return ideas.Select(idea => new GetIdeaResponseModel(
            ideaId: idea.Id,
            idea.IdeaName,
            idea.IdeaDescription,
            idea.TargetAmount,
            idea.AlreadyCollected,
            idea.FundingDeadline,
            idea.Rating,
            idea.GetAverageRating(),
            creatorUsername: idea.CreatorUsername ?? null
        ));
    }

    public RateIdeaResult RateIdea(IdeaModel ideaToRate, int rate, string ratedBy)
    {
        if (string.IsNullOrWhiteSpace(ratedBy))
            return RateIdeaResult.EmptyRatedBy;
        if (rate < 0 || rate > 5)
            return RateIdeaResult.InvalidRating;
        if (ideaToRate.Rating.Any(r => r.RatedBy == ratedBy))
            return RateIdeaResult.AlreadyRated;

        ideaToRate.UpdateRating(ratedBy, rate);
        return RateIdeaResult.Success;
    }
}