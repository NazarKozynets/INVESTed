using server.Models.DTO.Idea;
using server.Models.Idea;

namespace server.Models.Interfaces;

public interface IIdeaStrategy
{
    IdeaModel StartIdea(StartIdeaModel ideaData, string creatorId);
}