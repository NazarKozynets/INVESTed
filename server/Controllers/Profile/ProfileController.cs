using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models.DTO.Profile;
using server.models.user;
using server.Services.Profile;

namespace server.Controllers.Profile;

[Route("api/profile")]
[Authorize]
[ApiController]
public class ProfileController : ControllerBase
{
    private readonly ProfileService _profileService;
    private ILogger<ProfileController> _logger;

    public ProfileController(ProfileService profileService, ILogger<ProfileController> logger)
    {
        _profileService = profileService;
        _logger = logger;
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<object>> GetUserByUsername(string username)
    {
        var (data, error) = await _profileService.GetUserProfileByUsernameAsync(username, User);
        return error switch
        {
            "INVALID_CREDENTIALS" => Unauthorized(new { error }),
            "USER_NOT_FOUND" => NotFound(new { error }),
            "SERVER_ERROR" => StatusCode(500, new { error }),
            _ => Ok(data)
        };
    }

    [HttpPut("update")]
    public async Task<ActionResult<object>> UpdateUserProfileFields(UpdateProfileFieldsModel newProfileData)
    {
        var (data, error) = await _profileService.UpdateUserProfileFieldsAsync(newProfileData, User);

        if (error != null)
        {
            return error switch
            {
                "INVALID_CREDENTIALS" => Unauthorized(new { error }),
                "INVALID_ID" => NotFound(new { error }),
                "USER_NOT_FOUND" => NotFound(new { error }),
                "UNAUTHORIZED" => StatusCode(403, new { error }),
                "EMPTY_DATA" => BadRequest(new { error }),
                "EXISTING_USERNAME" => Conflict(new { error = "EXISTING_USERNAME" }),
                "EXISTING_EMAIL" => Conflict(new { error = "EXISTING_EMAIL" }),
                "SERVER_ERROR" => StatusCode(500, new { error }),
                _ => StatusCode(500, new { error }),
            };
        }

        if (data is Dictionary<string, object> dict && dict.TryGetValue("token", out var tokenValue))
        {
            var token = tokenValue.ToString();
            if (!string.IsNullOrEmpty(token))
            {
                Response.Cookies.Append("accessToken", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Lax,
                    Expires = DateTime.UtcNow.AddHours(1),
                    Path = "/"
                });
                
                return Ok(data);
            }
        }
        
        return StatusCode(500, new { error = "SERVER_ERROR" });
    }
}