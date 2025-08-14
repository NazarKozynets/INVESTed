using server.Models.DTO.Profile;
using server.Models.Interfaces;
using server.models.user;

namespace server.Models.Strategies;

public class ClientProfileStrategy : IProfileStrategy
{
    public GetUserProfileModel GetProfile(UserModel targetUser, bool isOwner)
    {
        return new GetUserProfileModel
        {
            UserId = targetUser.Id,
            Username = targetUser.Username,
            Email = isOwner ? targetUser.Email : null,
            AvatarUrl = targetUser.AvatarUrl,
            CanEdit = isOwner,
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

        targetUser.SetAvatarUrl(newProfileData.AvatarUrl!);
    }

    public bool CanBanUser()
    {
        return false;
    }

    public bool CanUpdateRole(UserRole targetUserRole, UserRole newRole)
    {
        return false;
    }
}