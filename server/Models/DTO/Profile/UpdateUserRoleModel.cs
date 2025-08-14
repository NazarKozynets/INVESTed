using server.models.user;

namespace server.Models.DTO.Profile;

public class UpdateUserRoleModel
{
    public string Id { get; set; }
    public UserRole NewRole { get; set; }
}