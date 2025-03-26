using server.models.user;

namespace server.Models.Interfaces;

public interface IProfileManagement
{
    void UpdateProfile(UserModel currentUser, UserModel newProfileData);
    void ChangePassword(UserModel currentUser, string newPasswordData);
}