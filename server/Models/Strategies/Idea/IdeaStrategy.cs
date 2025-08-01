using MongoDB.Bson.Serialization.Attributes;
using server.Enums;
using server.Models.DTO.Idea;
using server.Models.Idea;
using server.models.user;
using server.Services.Idea;

namespace server.Models.Interfaces;

public abstract class IdeaStrategy
{
    //created abstractt class instead of interface so I can make some methods optional 
    public virtual IdeaModel? StartIdea(StartIdeaModel ideaData, string creatorId)
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
            isClosed: idea.Status == IdeaStatus.Closed,
            canEdit: true
        ));
    }

    //for clients let it be canEdit: isOwner but moders and admins can edit 
    public virtual GetIdeaResponseModel GetFormattedIdea(IdeaModel idea, bool isOwner = false)
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
            creatorAvatarUrl: idea.CreatorAvatarUrl,
            canEdit: isOwner,
            isClosed: idea.Status == IdeaStatus.Closed
        );
    }

    public IEnumerable<GetIdeaResponseModel> GetFormattedIdeas(IEnumerable<IdeaModel> ideas)
    {
        return ideas.Select(idea => GetFormattedIdea(idea));
    }

    public virtual (IdeaRatingModel? newRate, RateIdeaResult resultMes) RateIdea(IdeaModel ideaToRate, int rate,
        string ratedBy, bool isOwner)
    {
        if (string.IsNullOrWhiteSpace(ratedBy))
            return (null, RateIdeaResult.EmptyRatedBy);
        if (rate < 0 || rate > 5)
            return (null, RateIdeaResult.InvalidRating);
        if (ideaToRate.Rating.Any(r => r.RatedBy == ratedBy))
            return (null, RateIdeaResult.AlreadyRated);
        if (isOwner)
            return (null, RateIdeaResult.RateYourIdea);

        var newRate = ideaToRate.AddRating(ratedBy, rate);
        return (newRate, RateIdeaResult.Success);
    }

    public virtual (IdeaCommentModel? newComment, CommentIdeaResult resultMes) AddCommentToIdea(IdeaModel ideaToAdd,
        string commentText, string commentatorId)
    {
        if (string.IsNullOrWhiteSpace(commentText))
            return (null, CommentIdeaResult.EmptyComment);
        if (string.IsNullOrWhiteSpace(commentatorId))
            return (null, CommentIdeaResult.EmptyCommentedBy);
        if (commentText.Length > 500)
            return (null, CommentIdeaResult.CommentTooLong);

        var newComment = ideaToAdd.AddComment(commentText, commentatorId);
        return (newComment, CommentIdeaResult.Success);
    }

    public virtual bool CanDeleteCommentFromIdea(string commentCreatorId, string currentUserId)
    {
        return commentCreatorId == currentUserId;
    }

    public virtual (decimal? updatedAlreadyCollected, IdeaFundingHistoryElementModel? fundingHistoryElementModel,
        InvestIdeaResult resultMes) InvestIdea(IdeaModel idea,
            string fundedById, string fundedByUsername, decimal fundingAmount, bool isOwner)
    {
        if (string.IsNullOrWhiteSpace(fundedById))
            return (null, null, InvestIdeaResult.EmptyFundedBy);
        if (string.IsNullOrWhiteSpace(fundedByUsername))
            return (null, null, InvestIdeaResult.EmptyFundedBy);
        if (fundingAmount <= 0 || fundingAmount > 1000000m)
            return (null, null, InvestIdeaResult.InvalidFundingAmount);
        if (isOwner)
            return (null, null, InvestIdeaResult.InvestYourIdea);
        if (fundingAmount > idea.TargetAmount)
            return (null, null, InvestIdeaResult.FundingAmountGreaterThanTarget);

        (decimal, IdeaFundingHistoryElementModel) updatedAlreadyCollected =
            idea.AddElementToFundingHistory(fundedById, fundedByUsername, fundingAmount);
        return (updatedAlreadyCollected.Item1, updatedAlreadyCollected.Item2, InvestIdeaResult.Success);
    }
}