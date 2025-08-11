using server.Models.DTO.Idea;
using server.Models.Idea;
using server.Models.Interfaces;

namespace server.Models.Strategies.Idea;

public class ModeratorIdeaStrategy : IdeaStrategy
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
            creatorAvatarUrl: idea.CreatorAvatarUrl,
            isOwnerBanned: idea.IsOwnerBanned ?? false,
            canEdit: true,
            isClosed: idea.Status == IdeaStatus.Closed
        );
    }
    
    public override bool CanDeleteCommentFromIdea(string commentCreatorId, string currentUserId)
    {
        return true;
    }
}