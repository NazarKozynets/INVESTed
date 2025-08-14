using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models.DTO.Profile;
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

    [HttpPut("update/fields")]
    public async Task<ActionResult<object>> UpdateUserProfileFields(UpdateProfileFieldsModel newProfileData)
    {
        var (data, error) = await _profileService.UpdateUserProfileFieldsAsync(newProfileData, User);

        if (error != null)
        {
            return error switch
            {
                "INVALID_CREDENTIALS" => Unauthorized(new { error }),
                "INVALID_ID" => BadRequest(new { error }),
                "USER_NOT_FOUND" => NotFound(new { error }),
                "UNAUTHORIZED" => Forbid(),
                "EMPTY_DATA" => BadRequest(new { error }),
                "EXISTING_USERNAME" => Conflict(new { error = "EXISTING_USERNAME" }),
                "EXISTING_EMAIL" => Conflict(new { error = "EXISTING_EMAIL" }),
                // 423 code for banned resource
                "UPDATE_BANNED_ACCOUNT" => StatusCode(423, new { error }),
                _ => StatusCode(500, new { error }),
            };
        }

        if (data is Dictionary<string, object> dict && dict.TryGetValue("token", out var tokenValue))
        {
            var token = tokenValue?.ToString();
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
            }
        }

        return Ok(data);
    }

    [HttpPatch("ban-status/{userId}")]
    public async Task<ActionResult<object>> ChangeUserBanStatus(string userId)
    {
        var (res, newStatus, error) = await _profileService.ChangeUserBanStatusAsync(userId, User);
        
        if (error != null || !res)
        {
            return error switch
            {
                "INVALID_ID" => BadRequest(new { error }),
                "USER_NOT_FOUND" => NotFound(new { error }),
                "NOT_ENOUGH_ACCESS" => Forbid(),
                _ => StatusCode(500, new { error }),
            };
        }

        return Ok(new { isBanned = newStatus });
    }

    [HttpPatch("update-role")]
    public async Task<ActionResult<object>> UpdateUserRole(UpdateUserRoleModel data)
    {
        var (res, error) = await _profileService.UpdateUserRoleAsync(data, User);

        if (error != null || !res)
        {
            return error switch
            {
                "INVALID_ID" => BadRequest(new { error }),
                "INVALID_ROLE" => BadRequest(new { error }),
                "USER_NOT_FOUND" => NotFound(new { error }),
                "NOT_ENOUGH_ACCESS" => Forbid(),
                "UPDATE_FAILED" => Conflict(new { error = "UPDATE_FAILED" }),
                _ => StatusCode(500, new { error }),
            };
        }
        
        return Ok();
    }
}