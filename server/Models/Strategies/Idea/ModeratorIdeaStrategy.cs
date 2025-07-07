using server.Models.DTO.Idea;
using server.Models.Interfaces;

namespace server.Models.Strategies.Idea;

public class ModeratorIdeaStrategy : IdeaStrategy
{
    public override bool CanDeleteCommentFromIdea(string commentCreatorId, string currentUserId)
    {
        return true;
    }
}