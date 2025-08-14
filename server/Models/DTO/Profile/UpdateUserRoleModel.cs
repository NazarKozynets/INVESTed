using server.models.user;

namespace server.Models.DTO.Profile;

public class UpdateProfileRoleModel
{
    public string Id { get; set; }
    public UserRole NewRole { get; set; }
}