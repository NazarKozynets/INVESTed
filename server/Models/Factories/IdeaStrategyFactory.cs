using server.Models.Interfaces;
using server.Models.Strategies.Idea;
using server.models.user;

namespace server.Models.Factories;

public class IdeaStrategyFactory
{
    public static IdeaStrategy GetIdeaStrategy(UserRole role)
    {
        return role switch
        {
            UserRole.Client => new ClientIdeaStrategy(),
            UserRole.Moderator => new ModeratorIdeaStrategy(),
            UserRole.Admin => new AdminIdeaStrategy(),
            _ => throw new NotImplementedException("Strategy for this role not implemented."),
        };
    }
}