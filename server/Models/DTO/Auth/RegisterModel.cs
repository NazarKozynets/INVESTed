using server.models.user;

namespace server.Models.DTO.Auth;

public class RegisterModel : UserModel
{
    public RegisterModel(string username, string password, string email, UserRole role)
        : base(username, password, email, role)
    {
    }
}