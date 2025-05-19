using server.Models.DTO.Idea;
using server.Models.Idea;
using server.Models.Interfaces;
using server.Services.Idea;

namespace server.Models.Strategies.Idea;

public class ClientIdeaStrategy : IdeaStrategy
{
    public override IdeaModel StartIdea(StartIdeaModel ideaData, string creatorId)
    {
        return new IdeaModel(creatorId, ideaData.IdeaName, ideaData.IdeaDescription, ideaData.TargetAmount, ideaData.FundingDeadline);
    }

    public override IEnumerable<GetIdeaResponseModel> GetAllUserIdeas(IEnumerable<IdeaModel> ideas, bool? isOwner)
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
            canEdit: isOwner ?? false
        ));
    }
    
    public override (IdeaRatingModel? newRate, RateIdeaResult resultMes) RateIdea(IdeaModel ideaToRate, int rate, string ratedBy, bool isOwner)
    {
        if (string.IsNullOrWhiteSpace(ratedBy))
            return (null, RateIdeaResult.EmptyRatedBy);
        if (rate < 0 || rate > 5)
            return (null, RateIdeaResult.InvalidRating);
        if (ideaToRate.Rating.Any(r => r.RatedBy == ratedBy))
            return (null, RateIdeaResult.AlreadyRated);
        if (isOwner)
            return (null, RateIdeaResult.YourIdea);

        var newRate = ideaToRate.AddRating(ratedBy, rate);
        return (newRate, RateIdeaResult.Success);
    }
    
    public override (IdeaCommentModel? newComment, CommentIdeaResult resultMes) AddCommentToIdea(IdeaModel ideaToAdd, string commentText, string commentedBy)
    {
        if (string.IsNullOrWhiteSpace(commentText))
            return (null, CommentIdeaResult.EmptyComment);
        if (string.IsNullOrWhiteSpace(commentedBy))
            return (null, CommentIdeaResult.EmptyCommentedBy);
        if (commentText.Length > 500)
            return (null, CommentIdeaResult.CommentTooLong);
        
        var newComment = ideaToAdd.AddComment(commentText, commentedBy);
        return (newComment, CommentIdeaResult.Success);
    }
}