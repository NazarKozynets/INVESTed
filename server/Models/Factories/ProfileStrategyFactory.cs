using System.Diagnostics;
using server.Models.Interfaces;
using server.Models.Strategies;
using server.models.user;

namespace server.Models.Factories;

public class ProfileStrategyFactory
{
    public static IProfileStrategy GetProfileStrategy(UserRole role)
    {
        return role switch
        {
            UserRole.Client => new ClientProfileStrategy(),
            UserRole.Moderator => new ModeratorProfileStrategy(),
            UserRole.Admin => new AdminProfileStrategy(),
            _ => throw new NotImplementedException("Strategy for this role not implemented.")
        };
    }
}