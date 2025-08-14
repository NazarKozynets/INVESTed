using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using server.Models.DTO.Auth;
using server.models.user;
using server.services.auth;
using server.Services.DataBase;

namespace server.Controllers.Auth;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IMongoCollection<UserModel> _usersCollection;

    public AuthController(
        AuthService authService,
        ILogger<AuthController> logger,
        MongoDbService mongoDbService)
    {
        _authService = authService;
        _logger = logger;
        _usersCollection = mongoDbService.GetCollection<UserModel>("Users");
    }

    [HttpGet("check")]
    public IActionResult CheckAuth()
    {
        if (!HttpContext.User.Identity?.IsAuthenticated ?? true)
            return Unauthorized();

        var expClaim = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Exp)?.Value;
        DateTime? exp = expClaim is not null
            ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(expClaim)).UtcDateTime
            : null;

        return Ok(new
        {
            userData = new
            {
                username = HttpContext.User.FindFirst(ClaimTypes.Name)?.Value,
                email = HttpContext.User.FindFirst(ClaimTypes.Email)?.Value,
                role = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value,
                userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                avatarUrl = HttpContext.User.FindFirst("avatar_url")?.Value,
                expiresIn = exp?.ToString("o")
            }
        });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel registerData)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(registerData.Username))
                return BadRequest(new { error = "USERNAME_REQUIRED" });

            if (string.IsNullOrWhiteSpace(registerData.Email) ||
                !new EmailAddressAttribute().IsValid(registerData.Email))
                return BadRequest(new { error = "INVALID_EMAIL" });

            if (string.IsNullOrWhiteSpace(registerData.Password))
                return BadRequest(new { error = "PASSWORD_REQUIRED" });

            var (success, userId, accessTokenExpiry, error) =
                await _authService.RegisterNewUserAsync(registerData, Response);

            if (!success)
                return Conflict(new
                {
                    error,
                    message = error == "EMAIL_EXISTS"
                        ? "Email already exists"
                        : "Username already taken"
                });

            return Ok(new
            {
                userData = new
                {
                    username = registerData.Username,
                    email = registerData.Email,
                    role = registerData.Role,
                    userId,
                    expiresIn = accessTokenExpiry
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Registration failed");
            return StatusCode(500, new { error = "SERVER_ERROR" });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel login)
    {
        if (string.IsNullOrWhiteSpace(login.Email) ||
            string.IsNullOrWhiteSpace(login.Password))
            return BadRequest(new { error = "INVALID_CREDENTIALS" });

        var (user, error) = await _authService.AuthenticateUserAsync(login.Email, login.Password);

        return error switch
        {
            "EMAIL_NOT_FOUND" => Unauthorized(new { error }),
            "INVALID_PASSWORD" => Unauthorized(new { error }),
            "SERVER_ERROR" => StatusCode(500, new { error }),
            _ when user is null => Unauthorized(new { error = "AUTH_FAILED" }),
            _ => await LoginSuccessAsync(user!)
        };
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordModel model)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(model.Email) ||
                !new EmailAddressAttribute().IsValid(model.Email))
                return BadRequest(new { error = "INVALID_EMAIL" });

            var result = await _authService.InitiatePasswordResetAsync(model.Email);
            if (!result.success)
                return NotFound(new { error = result.error });

            return Ok(new { message = "Password reset link sent to email" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Forgot password failed");
            return StatusCode(500, new { error = "SERVER_ERROR" });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel model)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(model.Token) ||
                string.IsNullOrWhiteSpace(model.NewPassword))
                return BadRequest(new { error = "INVALID_REQUEST" });

            var result = await _authService.ResetPasswordAsync(model.Token, model.NewPassword);
            if (!result.success)
                return BadRequest(new { error = "INVALID_OR_EXPIRED_TOKEN_RESET_PASSWORD" });

            return Ok(new { message = "Password reset successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Password reset failed");
            return StatusCode(500, new { error = "SERVER_ERROR" });
        }
    }

    private async Task<IActionResult> LoginSuccessAsync(UserModel user)
    {
        var tokens = await _authService.GenerateAndSetTokensAsync(user, Response);

        return Ok(new
        {
            userData = new
            {
                userId = user.Id,
                username = user.Username,
                email = user.Email,
                role = user.Role,
                avatarUrl = user.AvatarUrl,
                expiresIn = tokens.accessTokenExpiry.ToString("o")
            }
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var username = User.Identity?.Name;
        if (!string.IsNullOrEmpty(username))
        {
            var user = await _usersCollection
                .Find(u => u.Username == username)
                .FirstOrDefaultAsync();

            user?.ClearRefreshToken();
        }

        Response.Cookies.Delete("accessToken");
        Response.Cookies.Delete("refreshToken");

        return Ok(new { message = "Logged out" });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken()
    {
        try
        {
            var refreshToken = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
                return BadRequest(new { error = "TOKEN_REQUIRED" });

            var user = await _usersCollection
                .Find(u => u.RefreshToken == refreshToken)
                .FirstOrDefaultAsync();

            if (user is null || user.RefreshTokenExpiry <= DateTime.UtcNow)
                return Unauthorized(new { error = "INVALID_REFRESH_TOKEN" });

            var tokens = await _authService.GenerateAndSetTokensAsync(user, Response);

            return Ok(new { expiresIn = tokens.accessTokenExpiry.ToString("o") });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Refresh failed");
            return Unauthorized(new { error = "REFRESH_FAILED" });
        }
    }
}