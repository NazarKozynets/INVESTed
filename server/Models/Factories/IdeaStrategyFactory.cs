using server.Models.Interfaces;
using server.Models.Strategies.Idea;
using server.models.user;

namespace server.Models.Factories;

public class IdeaStrategyFactory
{
    public static IIdeaStrategy GetIdeaStrategy(UserRole role)
    {
        return role switch
        {
            UserRole.Client => new ClientIdeaStrategy(),
            _ => throw new NotImplementedException("Strategy for this role not implemented."),
        };
    }
}