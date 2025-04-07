using System.ComponentModel.DataAnnotations;

namespace server.Models.DTO.Auth;

public class RefreshTokenRequest
{
    [Required]
    public string AccessToken { get; set; }  
    
    [Required]
    public string RefreshToken { get; set; }
}