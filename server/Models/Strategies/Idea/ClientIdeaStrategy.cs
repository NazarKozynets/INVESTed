using server.Models.DTO.Idea;
using server.Models.Idea;
using server.Models.Interfaces;

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
    
    
}