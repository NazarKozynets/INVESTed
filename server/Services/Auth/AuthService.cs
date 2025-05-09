using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using server.models.user;
using server.Services.DataBase;
using server.Models.DTO.Auth;

namespace server.services.auth;

public class AuthService
{
    private readonly IConfiguration _configuration;
    private readonly IMongoCollection<UserModel> _usersCollection;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IConfiguration configuration,
        MongoDbService mongoDbService,
        ILogger<AuthService> logger)
    {
        _configuration = configuration;
        _usersCollection = mongoDbService.GetCollection<UserModel>("Users");
        _logger = logger;
    }

    public async Task<(bool success, string? userId, string? error)> RegisterNewUserAsync(RegisterModel user)
    {
        try
        {
            var existingUser = await _usersCollection
                .Find(u => u.Username == user.Username || u.Email == user.Email)
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                var error = existingUser.Email == user.Email
                    ? "EMAIL_EXISTS"
                    : "USERNAME_EXISTS";
                return (false, null, error);
            }

            var newUser = new UserModel(
                user.Username,
                BCrypt.Net.BCrypt.HashPassword(user.Password), 
                user.Email,
                user.Role
            );

            await _usersCollection.InsertOneAsync(newUser);
            return (true, newUser.Id, null);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Registration error");
            return (false, null, "SERVER_ERROR");
        }
    }

    public async Task<(UserModel? user, string? error)> AuthenticateUserAsync(
        string email,
        string password)
    {
        try
        {
            var user = await _usersCollection
                .Find(u => u.Email == email)
                .FirstOrDefaultAsync();

            if (user is null)
                return (null, "EMAIL_NOT_FOUND");

            if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
                return (null, "INVALID_PASSWORD");

            return (user, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Auth error");
            return (null, "SERVER_ERROR");
        }
    }

    public (string token, DateTime expires) GenerateJwtToken(
        string username,
        string email,
        UserRole role,
        string userId)
    {
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
        var expires = DateTime.UtcNow.AddMinutes(
            _configuration.GetValue<int>("Jwt:AccessTokenExpiryInMinutes", 60));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    public async Task UpdateRefreshTokenAsync(UserModel user, string? refreshToken)
    {
        try
        {
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = refreshToken is not null
                ? DateTime.UtcNow.AddDays(
                    _configuration.GetValue<int>("Jwt:RefreshTokenExpiryInDays", 7))
                : null;

            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Refresh token error");
            throw;
        }
    }

    public async Task<UserModel?> GetUserFromClaimsAsync(ClaimsPrincipal claimsPrincipal)
    {
        try
        {
            var userId = claimsPrincipal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return null;

            return await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting user from claims");
            return null;
        }
    }
}
