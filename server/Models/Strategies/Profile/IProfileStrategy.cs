using server.Models.DTO.Profile;
using server.models.user;

namespace server.Models.Interfaces;

public interface IProfileStrategy
{
    GetUserProfileModel GetProfile(UserModel targetUser, bool isOwner);
    bool CanUpdateProfile(bool isOwner);
    void UpdateProfile(UserModel targetUser, UpdateProfileFieldsModel newProfileData);
    bool CanBanUser();
    bool CanUpdateRole(UserRole targetUserRole, UserRole newRole);
}