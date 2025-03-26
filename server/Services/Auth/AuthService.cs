using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using server.models.user;
using server.Services.DataBase;
using Microsoft.Extensions.Logging;
using server.Models.DTO.Auth;

namespace server.services.auth;

public class AuthService(IConfiguration configuration, MongoDbService mongoDbService, ILogger<AuthService> logger)
{
    private readonly IMongoCollection<UserModel> _usersCollection = mongoDbService.GetCollection<UserModel>("Users");

    public bool RegisterNewUser(RegisterModel user)
    {
        var existingUser = _usersCollection.Find(u => u.Username == user.Username).FirstOrDefault();
        if (existingUser != null)
        {
            logger.LogWarning("User with username {Username} already exists", user.Username);
            return false; 
        }

        user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
        
        _usersCollection.InsertOne(user);
        return true;
    }
    
    public ClientUser? AuthenticateUser(string email, string password)
    {
        var user = _usersCollection.Find(u => u.Email == email).FirstOrDefault();
        if (user != null && BCrypt.Net.BCrypt.Verify(password, user.Password))
        {
            return user; 
        }
        return null;
    }
    
    public string GenerateJwtToken(string username, UserRole userRole)
    {
        string key = configuration["Jwt:Key"] ?? throw new ArgumentNullException("Jwt:Key", "JWT key is missing in configuration");
        string issuer = configuration["Jwt:Issuer"] ?? throw new ArgumentNullException("Jwt:Issuer", "JWT issuer is missing in configuration");
        string audience = configuration["Jwt:Audience"] ?? throw new ArgumentNullException("Jwt:Audience", "JWT audience is missing in configuration");

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, userRole.ToString()),
        };

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var creds = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

}