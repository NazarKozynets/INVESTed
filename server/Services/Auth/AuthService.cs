using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using server.models.user;
using server.Services.DataBase;
using server.Models.DTO.Auth;
using server.Services.Email;

namespace server.services.auth;

public class AuthService
{
    private readonly IConfiguration _configuration;
    private readonly IMongoCollection<UserModel> _usersCollection;
    private readonly ILogger<AuthService> _logger;
    private readonly IServiceProvider _provider;

    public AuthService(
        IConfiguration configuration,
        MongoDbService mongoDbService,
        IServiceProvider provider,
        ILogger<AuthService> logger)
    {
        _configuration = configuration;
        _usersCollection = mongoDbService.GetCollection<UserModel>("Users");
        _provider = provider;
        _logger = logger;
    }

    public async Task<(bool success, string? userId, string? accessTokenExpiry, string? error)> RegisterNewUserAsync(RegisterModel user, HttpResponse response)
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
                return (false, null, null, error);
            }

            var newUser = new UserModel(
                user.Username,
                BCrypt.Net.BCrypt.HashPassword(user.Password), 
                user.Email,
                user.Role
            );

            await _usersCollection.InsertOneAsync(newUser);

            var tokenData = await GenerateAndSetTokensAsync(newUser, response);
            var accessTokenExpiry = tokenData.accessTokenExpiry.ToString("o");
            
            return (true, newUser.Id, accessTokenExpiry, null);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Registration error");
            return (false, null, null, "SERVER_ERROR");
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

    public static string GenerateUrlSafeToken(int size = 32)
    {
        var bytes = new byte[size];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);

        return Convert.ToBase64String(bytes)
            .TrimEnd('=')   
            .Replace('+', '-')  
            .Replace('/', '_');
    }
    
    public async Task<(bool success, string? error)> InitiatePasswordResetAsync(string email)
    {
        try
        {
            var user = await _usersCollection
                .Find(u => u.Email == email)
                .FirstOrDefaultAsync();

            if (user is null)
                return (false, "EMAIL_NOT_FOUND");

            var resetToken = GenerateUrlSafeToken(32);
            var resetTokenExpiry = DateTime.UtcNow.AddHours(
                _configuration.GetValue<int>("PasswordReset:TokenExpiryInHours", 24));

            user.SetPasswordResetToken(resetToken, resetTokenExpiry);
            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);

            var emailResult = await _provider
                .GetRequiredService<EmailService>()
                .SendMailAboutResettingPasswordAsync(user.Email, resetToken);

            if (emailResult.error != null)
                return (false, emailResult.error);

            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Password reset initiation failed");
            return (false, "SERVER_ERROR");
        }
    }

    public async Task<(bool success, string? error)> ResetPasswordAsync(string token, string newPassword)
    {
        try
        {
            var user = await _usersCollection
                .Find(u => u.PasswordResetToken == token)
                .FirstOrDefaultAsync();
this._logger.LogInformation("token: {token} \npassword: {pass}", token, newPassword);
            if (user is null 
                || !user.PasswordResetTokenExpiry.HasValue 
                || DateTime.SpecifyKind(user.PasswordResetTokenExpiry.Value, DateTimeKind.Utc) <= DateTime.UtcNow)
            {
                return (false, "INVALID_OR_EXPIRED_TOKEN");
            }

            user.SetPassword(BCrypt.Net.BCrypt.HashPassword(newPassword));

            user.ClearPasswordResetToken();

            await _usersCollection.ReplaceOneAsync(u => u.Id == user.Id, user);

            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Password reset failed");
            return (false, "SERVER_ERROR");
        }
    }
    
    public (string token, DateTime expires) GenerateJwtToken(
        string username,
        string email,
        UserRole role,
        string avatarUrl,
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
            new Claim("avatar_url", avatarUrl ?? ""),
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
            DateTime refreshTokenExpiry = DateTime.UtcNow.AddDays(_configuration.GetValue<int>("Jwt:RefreshTokenExpiryInDays", 7));
            user.SetRefreshToken(refreshToken, refreshTokenExpiry);
            
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
    
    public async Task<(string accessToken, string refreshToken, DateTime accessTokenExpiry, DateTime refreshTokenExpiry)>
        GenerateAndSetTokensAsync(UserModel user, HttpResponse response)
    {
        var (accessToken, accessTokenExpiry) = GenerateJwtToken(
            user.Username, user.Email, user.Role, user.AvatarUrl!, user.Id);

        var refreshToken = GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(
            _configuration.GetValue<int>("Jwt:RefreshTokenExpiryInDays", 7));

        await UpdateRefreshTokenAsync(user, refreshToken);

        response.Cookies.Append("accessToken", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = accessTokenExpiry,
            Path = "/"
        });

        response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
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
