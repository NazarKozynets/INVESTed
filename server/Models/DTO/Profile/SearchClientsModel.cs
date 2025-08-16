namespace server.Models.DTO.Profile;

public class SearchClientsModel
{
    public string Id { get; set; }
    public string Username { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsBanned { get; set; }
}