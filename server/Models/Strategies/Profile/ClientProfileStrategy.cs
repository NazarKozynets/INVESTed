using server.Models.DTO.Profile;
using server.Models.Interfaces;
using server.models.user;

namespace server.Models.Strategies;

public class ClientProfileStrategy : IProfileStrategy
{
    public object GetProfile(UserModel targetUser, bool isOwner)
    {
        return new 
        {
            Username = targetUser.Username,
            Email = isOwner ? targetUser.Email : null, 
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
            targetUser.Username = newProfileData.Username;
        }

        if (!string.IsNullOrWhiteSpace(newProfileData.Email))
        {
            targetUser.Email = newProfileData.Email;
        }
    }
}