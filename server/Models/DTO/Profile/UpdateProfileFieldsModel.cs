using server.models.user;

namespace server.Models.DTO.Profile;

public class UpdateProfileFieldsModel
{
    public string Id { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole? Role { get; set; }
}