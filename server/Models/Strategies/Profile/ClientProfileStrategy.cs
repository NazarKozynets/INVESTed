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
            Username = targetUser.Username,
            Email = isOwner ? targetUser.Email : null,
            AvatarUrl = targetUser.AvatarUrl,
            CanEdit = isOwner,
        };
    }

    public bool CanUpdateProfile(UserModel targetUser, UserModel currentUser)
    {
        return targetUser.Id == currentUser.Id;
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
}