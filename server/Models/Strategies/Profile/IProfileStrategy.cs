using server.Models.DTO.Profile;
using server.models.user;

namespace server.Models.Interfaces;

public interface IProfileStrategy
{
    GetUserProfileModel GetProfile(UserModel targetUser, bool isOwner);
    bool CanUpdateProfile(UserModel targetUser, UserModel currentUser);
    void UpdateProfile(UserModel targetUser, UpdateProfileFieldsModel newProfileData);
}