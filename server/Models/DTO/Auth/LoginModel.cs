using server.models.user;

namespace server.Models.DTO.Auth;

public class LoginModel
{
    public string Email { get; set; }
    public string Password { get; set; }
}