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

    [BsonElement("username")] public string Username { get; private set; }

    [BsonElement("password")] public string Password { get; private set; }

    [BsonElement("email")] public string Email { get; private set; }

    [BsonElement("role")] public UserRole Role { get; private set; }

    public string? RefreshToken { get; private set; }
    public DateTime? RefreshTokenExpiry { get; private set; }

    public string? PasswordResetToken { get; private set; }
    public DateTime? PasswordResetTokenExpiry { get; private set; }

    public UserModel(string username, string password, string email, UserRole role)
    {
        SetUsername(username);
        SetPassword(password);
        SetEmail(email);
        Role = role;
    }

    public void SetUsername(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
            throw new ArgumentException("Username cannot be empty.");
        Username = username;
    }

    public void SetEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be empty.");
        Email = email;
    }

    public void SetPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("Password cannot be empty.");
        Password = password;
    }

    public void SetRole(UserRole newRole)
    {
        Role = newRole;
    }

    public void SetRefreshToken(string token, DateTime expiry)
    {
        if (string.IsNullOrWhiteSpace(token))
            throw new ArgumentException("Refresh token cannot be empty.");
        if (expiry <= DateTime.UtcNow)
            throw new ArgumentException("Expiry must be in the future.");

        RefreshToken = token;
        RefreshTokenExpiry = expiry;
    }

    public void ClearRefreshToken()
    {
        RefreshToken = null;
        RefreshTokenExpiry = null;
    }

    public void SetPasswordResetToken(string token, DateTime expiry)
    {
        if (string.IsNullOrWhiteSpace(token))
            throw new ArgumentException("Reset token cannot be empty.");
        if (expiry <= DateTime.UtcNow)
            throw new ArgumentException("Expiry must be in the future.");

        PasswordResetToken = token;
        PasswordResetTokenExpiry = expiry;
    }

    public void ClearPasswordResetToken()
    {
        PasswordResetToken = null;
        PasswordResetTokenExpiry = null;
    }
}