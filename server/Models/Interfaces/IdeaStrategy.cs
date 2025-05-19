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

    public GetIdeaResponseModel GetFormattedIdea(IdeaModel idea)
    {
        return new GetIdeaResponseModel(
            ideaId: idea.Id,
            idea.IdeaName,
            idea.IdeaDescription,
            idea.TargetAmount,
            idea.AlreadyCollected,
            idea.FundingDeadline,
            idea.Rating,
            idea.GetAverageRating(),
            creatorUsername: idea.CreatorUsername ?? null,
            comments: idea.Comments
        );
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

    public virtual (IdeaRatingModel? newRate, RateIdeaResult resultMes) RateIdea(IdeaModel ideaToRate, int rate, string ratedBy, bool isOwner)
    {
        return (null, RateIdeaResult.NotEnoughAccess);
    }

    public virtual (IdeaCommentModel? newComment, CommentIdeaResult resultMes) AddCommentToIdea(IdeaModel ideaToAdd, string commentText, string commentedBy)
    {
        return (null, CommentIdeaResult.NotEnoughAccess);
    }
}