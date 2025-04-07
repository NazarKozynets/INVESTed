using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace server.models.user;

public enum UserRole
{
    Client = 0, 
    Moderator = 1,
    Admin = 2
}

public class UserModel
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; private set; } = ObjectId.GenerateNewId().ToString();

    [BsonElement("username")]
    public string Username { get; set; }

    [BsonElement("password")]
    public string Password { get; set; }

    [BsonElement("email")]
    public string Email { get; set; }

    [BsonElement("role")]
    public UserRole Role { get; set; }
    
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
    
    public UserModel(string username, string password, string email, UserRole role)
    {
        Username = username;
        Password = password;
        Email = email;
        Role = role;
    }
}
