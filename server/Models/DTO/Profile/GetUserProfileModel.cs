namespace server.Models.DTO.Profile;

public class GetUserProfileModel
{
    public string Username { get; set; }
    public string? Email { get; set; }
    public bool CanEdit { get; set; }
}