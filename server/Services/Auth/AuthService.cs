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

    public (bool success, string? userId, string? error) RegisterNewUser(RegisterModel user)
    {
        try
        {
            var existingUser = _usersCollection
                .Find(u => u.Username == user.Username || u.Email == user.Email)
                .FirstOrDefault();

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

            _usersCollection.InsertOne(newUser);
            return (true, newUser.Id, null);
        }
        catch (Exception e)
        {
            _logger.LogError("Registration error: {Message}", e.Message);
            throw;
        }
    }

    public UserModel? AuthenticateUser(string email, string password)
    {
        try
        {
            var user = _usersCollection
                .Find(u => u.Email == email)
                .FirstOrDefault();

            return user != null && BCrypt.Net.BCrypt.Verify(password, user.Password) 
                ? user 
                : null;
        }
        catch (Exception e)
        {
            _logger.LogError("Auth error: {Message}", e.Message);
            throw;
        }
    }

    public (string token, DateTime expires) GenerateJwtToken(
        string username, 
        UserRole role, 
        string userId)
    {
        var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
        var expires = DateTime.UtcNow.AddMinutes(
            _configuration.GetValue<int>("Jwt:AccessTokenExpiryInMinutes", 30));

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
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

    public async Task UpdateRefreshToken(UserModel user, string? refreshToken)
    {
        try
        {
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = refreshToken != null 
                ? DateTime.UtcNow.AddDays(
                    _configuration.GetValue<int>("Jwt:RefreshTokenExpiryInDays", 7)) 
                : null;

            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);
        }
        catch (Exception e)
        {
            _logger.LogError("Refresh token error: {Message}", e.Message);
            throw;
        }
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        try
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            return tokenHandler.ValidateToken(
                token, 
                tokenValidationParameters, 
                out _);
        }
        catch
        {
            return null;
        }
    }
}