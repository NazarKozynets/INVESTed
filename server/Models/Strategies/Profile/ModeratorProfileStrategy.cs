using server.Models.DTO.Profile;
using server.Models.Interfaces;
using server.models.user;

namespace server.Models.Strategies;

public class ModeratorProfileStrategy : IProfileStrategy
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
        return isOwner;
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
    }
    
    public bool CanBanUser()
    {
        return true;
    }
    
    public bool CanUpdateRole(UserRole targetUserRole, UserRole newRole)
    {
        switch (targetUserRole)
        {
            case UserRole.Client when newRole == UserRole.Moderator:
            case UserRole.Moderator when newRole == UserRole.Client:
                return true;
            default:
                return false;
        }
    }
}