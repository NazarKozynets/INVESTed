using server.Enums;
using server.Models.DTO.Idea;
using server.Models.Idea;
using server.Models.Interfaces;

namespace server.Models.Strategies.Idea;

public class AdminIdeaStrategy : IdeaStrategy
{
    public override GetIdeaResponseModel GetFormattedIdea(IdeaModel idea, bool isOwner = false)
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
            comments: idea.Comments,
            creatorUsername: idea.CreatorUsername ?? null,
            canEdit: true,
            isClosed: idea.Status == IdeaStatus.Closed
        );
    }
    
    public override (IdeaRatingModel? newRate, RateIdeaResult resultMes) RateIdea(IdeaModel ideaToRate, int rate,
        string ratedBy, bool isOwner)
    {
        return (null, RateIdeaResult.NotEnoughAccess);
    }
    
    public override (IdeaCommentModel? newComment, CommentIdeaResult resultMes) AddCommentToIdea(IdeaModel ideaToAdd,
        string commentText, string commentatorId)
    {
        return (null, CommentIdeaResult.NotEnoughAccess);
    }
    
    public override bool CanDeleteCommentFromIdea(string commentCreatorId, string currentUserId)
    {
        return true;
    }
    
    public override (decimal? updatedAlreadyCollected, IdeaFundingHistoryElementModel? fundingHistoryElementModel,
        InvestIdeaResult resultMes) InvestIdea(IdeaModel idea,
            string fundedById, string fundedByUsername, decimal fundingAmount, bool isOwner)
    {
        return (null, null, InvestIdeaResult.NotEnoughAccess);
    }
}