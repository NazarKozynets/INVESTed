using server.models.user;

namespace server.Models.DTO.Auth;

public class RegisterModel
{
    public string Username { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    public UserRole Role { get; set; }
}