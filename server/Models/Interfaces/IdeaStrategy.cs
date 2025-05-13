using MongoDB.Bson.Serialization.Attributes;
using server.Models.DTO.Idea;
using server.Models.Idea;

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
            canEdit: true
        ));
    }

    public IEnumerable<GetIdeaResponseModel> GetFormattedSortedIdeas(IEnumerable<IdeaModel> ideas)
    {
        return ideas.Select(idea => new GetIdeaResponseModel(
            ideaId: idea.Id,
            idea.IdeaName,
            idea.IdeaDescription,
            idea.TargetAmount,
            idea.AlreadyCollected,
            idea.FundingDeadline,
            creatorUsername: idea.CreatorUsername ?? null
        ));
    }
}