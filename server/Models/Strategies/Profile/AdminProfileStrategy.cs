using server.Models.DTO.Profile;
using server.Models.Interfaces;
using server.models.user;

namespace server.Models.Strategies;

public class AdminProfileStrategy : IProfileStrategy
{
    public GetUserProfileModel GetProfile(UserModel targetUser, bool isOwner)
    {
        return new GetUserProfileModel
        {
            UserId = targetUser.Id,
            UserRole = targetUser.Role,
            Username = targetUser.Username,
            Email = targetUser.Email,
            AvatarUrl = targetUser.AvatarUrl,
            CanEdit = true,
            IsBanned = targetUser.IsBanned
        };
    }

    public bool CanUpdateProfile(bool isOwner)
    {
        return true;
    }

    public void UpdateProfile(UserModel targetUser, UpdateProfileFieldsModel newProfileData)
    {
        if (!string.IsNullOrWhiteSpace(newProfileData.Username))
        {
            targetUser.SetUsername(newProfileData.Username);
        }

        if (!string.IsNullOrWhiteSpace(newProfileData.Email))
        {
            targetUser.SetEmail(newProfileData.Email);
        }

        if (newProfileData.Role.HasValue)
        {
            targetUser.SetRole(newProfileData.Role.Value);
        }
    }
    
    public bool CanBanUser()
    {
        return true;
    }

    public bool CanUpdateRole(UserRole targetUserRole, UserRole newRole)
    {
        return true;
    }
}