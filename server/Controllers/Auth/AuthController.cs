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

        var expiresClaim = HttpContext.User.FindFirst(JwtRegisteredClaimNames.Exp)?.Value;
        var expiresIn = expiresClaim != null 
            ? DateTimeOffset.FromUnixTimeSeconds(long.Parse(expiresClaim)).DateTime 
            : (DateTime?)null;

        return Ok(new
        {
            userData = new
            {
                userName = HttpContext.User.FindFirst(ClaimTypes.Name)?.Value,
                email = HttpContext.User.FindFirst(ClaimTypes.Email)?.Value,
                role = HttpContext.User.FindFirst(ClaimTypes.Role)?.Value,
                userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                expiresIn = expiresIn?.ToString("o")
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

            var (success, userId, error) = _authService.RegisterNewUser(registerData);
            if (!success)
                return Conflict(new { error, message = error == "EMAIL_EXISTS" 
                    ? "Email already exists" 
                    : "Username already taken" });

            var result = await GenerateAndSetTokens(
                registerData.Username, 
                registerData.Role, 
                userId);

            return Ok(new
            {
                userData = new { 
                    userName = registerData.Username, 
                    email = registerData.Email, 
                    role = registerData.Role, 
                    userId,
                    expiresIn = result.accessTokenExpiry.ToString("o") 
                }
            });
        }
        catch (Exception e)
        {
            _logger.LogError("Registration failed: {Message}", e.Message);
            return StatusCode(500, new { error = "SERVER_ERROR" });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel login)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(login.Email) || 
                string.IsNullOrWhiteSpace(login.Password))
                return BadRequest(new { error = "INVALID_CREDENTIALS" });

            var user = _authService.AuthenticateUser(login.Email, login.Password);
            if (user == null)
                return Unauthorized(new { error = "AUTH_FAILED" });

            var result = await GenerateAndSetTokens(
                user.Username, 
                user.Role, 
                user.Id);

            return Ok(new {
                userData = new {
                    userId = user.Id,
                    userName = user.Username,
                    email = user.Email,
                    role = user.Role,
                    expiresIn = result.accessTokenExpiry.ToString("o")
                }
            });
        }
        catch (Exception e)
        {
            _logger.LogError("Login failed: {Message}", e.Message);
            return StatusCode(500, new { error = "SERVER_ERROR" });
        }
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
            
            if (user != null)
                await _authService.UpdateRefreshToken(user, null);
        }

        Response.Cookies.Delete("accessToken");
        Response.Cookies.Delete("refreshToken");

        return Ok(new { message = "Logged out" });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.AccessToken) || 
                string.IsNullOrEmpty(request.RefreshToken))
                return BadRequest(new { error = "TOKEN_REQUIRED" });

            var principal = _authService.GetPrincipalFromExpiredToken(request.AccessToken);
            var username = principal?.Identity?.Name;

            if (string.IsNullOrEmpty(username))
                return Unauthorized(new { error = "INVALID_TOKEN" });

            var user = await _usersCollection
                .Find(u => u.Username == username)
                .FirstOrDefaultAsync();

            if (user == null || 
                user.RefreshToken != request.RefreshToken || 
                user.RefreshTokenExpiry <= DateTime.UtcNow)
                return Unauthorized(new { error = "INVALID_REFRESH_TOKEN" });

            var result = await GenerateAndSetTokens(
                user.Username, 
                user.Role, 
                user.Id);

            return Ok(new
            {
                expiresIn = result.accessTokenExpiry.ToString("o")
            });
        }
        catch (Exception e)
        {
            _logger.LogError("Refresh failed: {Message}", e.Message);
            return Unauthorized(new { error = "REFRESH_FAILED" });
        }
    }

    private async Task<(string accessToken, string refreshToken, DateTime accessTokenExpiry, DateTime refreshTokenExpiry)> 
        GenerateAndSetTokens(string username, UserRole role, string userId)
    {
        var (accessToken, accessTokenExpiry) = _authService.GenerateJwtToken(
            username, role, userId);
        
        var refreshToken = _authService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        var user = await _usersCollection
            .Find(u => u.Username == username)
            .FirstOrDefaultAsync();
        
        if (user != null)
            await _authService.UpdateRefreshToken(user, refreshToken);

        Response.Cookies.Append("accessToken", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = accessTokenExpiry,
            Path = "/"
        });

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = refreshTokenExpiry,
            Path = "/"
        });

        return (accessToken, refreshToken, accessTokenExpiry, refreshTokenExpiry);
    }
}