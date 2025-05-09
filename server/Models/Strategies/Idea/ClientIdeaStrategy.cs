using server.Models.DTO.Idea;
using server.Models.Idea;
using server.Models.Interfaces;

namespace server.Models.Strategies.Idea;

public class ClientIdeaStrategy : IIdeaStrategy
{
    public IdeaModel StartIdea(StartIdeaModel ideaData, string creatorId)
    {
        return new IdeaModel(creatorId, ideaData.IdeaName, ideaData.IdeaDescription, ideaData.TargetAmount, ideaData.FundingDeadline);
    }
}