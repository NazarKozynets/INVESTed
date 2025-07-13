using server.Models.Strategies.Forum;
using server.Models.Strategies.Idea;
using server.models.user;

namespace server.Models.Factories;

public class ForumStrategyFactory
{
    public static ForumStrategy GetForumStrategy(UserRole role)
    {
        return role switch
        {
            UserRole.Client => new ClientForumStrategy(),
            UserRole.Moderator => new ModeratorForumStrategy(),
            UserRole.Admin => new AdminForumStrategy(),
            _ => throw new NotImplementedException("Strategy for this role not implemented."),
        };
    }
}