using server.Enums;
using server.Models.DTO.Idea;
using server.Models.Idea;
using server.Models.Interfaces;
using server.models.user;
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
            isClosed: idea.Status == IdeaStatus.Closed,
            canEdit: isOwner ?? false
        ));
    }
}