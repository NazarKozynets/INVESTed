using server.Models.Interfaces;

namespace server.models.user;

public class ClientUser : UserModel
{
    public ClientUser(string username, string password, string email, UserRole role)
        : base(username, password, email, role)
    {
    }
    
    public void UpdateProfile(UserModel currentUser, UserModel newProfileData)
    {
        if (currentUser.Id != newProfileData.Id)
        {
            throw new UnauthorizedAccessException("Authorization failed");
        }

        this.Username = newProfileData.Username;
        this.Email = newProfileData.Email;
    }

    public void ChangePassword(UserModel currentUser, string newPasswordData)
    {
        
    }
}