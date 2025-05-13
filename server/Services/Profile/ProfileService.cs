using MongoDB.Driver;
using server.Models.Factories;
using server.models.user;
using server.Services.DataBase;
using System.Security.Claims;
using MongoDB.Bson;
using server.Models.DTO.Profile;
using server.services.auth;

namespace server.Services.Profile;

public class ProfileService
{
    private readonly IMongoCollection<UserModel> _usersCollection;
    private readonly ILogger<ProfileService> _logger;
    private readonly AuthService _authService;

    public ProfileService(
        MongoDbService mongoDbService,
        ILogger<ProfileService> logger,
        AuthService authService)
    {
        _usersCollection = mongoDbService.GetCollection<UserModel>("Users");
        _logger = logger;
        _authService = authService;
    }

    public async Task<(object? data, string? error)> GetUserProfileByUsernameAsync(string username, ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUser = await _authService.GetUserFromClaimsAsync(userClaims);

            if (currentUser == null)
                return (null, "INVALID_CREDENTIALS");
        
            var targetUser = await _usersCollection.Find(u => u.Username == username).FirstOrDefaultAsync();
            if (targetUser == null)
            {
                _logger.LogWarning("User {username} doesn't exist", username);
                return (null, "USER_NOT_FOUND");
            }
        
            var strategy = ProfileStrategyFactory.GetProfileStrategy(currentUser.Role);
            var profileData = strategy.GetProfile(targetUser, currentUser.Id == targetUser.Id);
        
            return (profileData, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile");
            return (null, "SERVER_ERROR");
        }
    }

    public async Task<(object? data, string? error)> GetUserProfileByIdAsync(string id, ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUser = await _authService.GetUserFromClaimsAsync(userClaims);

            if (currentUser == null)
                return (null, "INVALID_CREDENTIALS");
        
            var targetUser = await _usersCollection.Find(u => u.Id == id).FirstOrDefaultAsync();
            if (targetUser == null)
            {
                _logger.LogWarning("User {id} doesn't exist", id);
                return (null, "USER_NOT_FOUND");
            }
        
            var strategy = ProfileStrategyFactory.GetProfileStrategy(currentUser.Role);
            var profileData = strategy.GetProfile(targetUser, currentUser.Id == targetUser.Id);
        
            return (profileData, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user profile");
            return (null, "SERVER_ERROR");
        }
    }
    
    public async Task<(object? data, string? error)> UpdateUserProfileFieldsAsync(
        UpdateProfileFieldsModel data, ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUser = await _authService.GetUserFromClaimsAsync(userClaims);

            if (currentUser == null)
                return (null, "INVALID_CREDENTIALS");

            if (string.IsNullOrWhiteSpace(data.Id) || !ObjectId.TryParse(data.Id, out var objectId))
                return (null, "INVALID_ID");

            var targetUser = await _usersCollection.Find(u => u.Id == objectId.ToString()).FirstOrDefaultAsync();
            if (targetUser == null)
                return (null, "USER_NOT_FOUND");

            var strategy = ProfileStrategyFactory.GetProfileStrategy(currentUser.Role);

            if (!strategy.CanUpdateProfile(currentUser, targetUser))
                return (null, "UNAUTHORIZED");

            if (string.IsNullOrWhiteSpace(data.Username) && string.IsNullOrWhiteSpace(data.Email)) 
                return (null, "EMPTY_DATA");
            
            if (data.Username != null && await _usersCollection.Find(u => u.Username == data.Username).AnyAsync())
                return (null, "EXISTING_USERNAME");
            
            if (data.Email != null && await _usersCollection.Find(u => u.Email == data.Email).AnyAsync()) 
                return (null, "EXISTING_EMAIL");
            
            strategy.UpdateProfile(targetUser, data);

            await _usersCollection.ReplaceOneAsync(
                Builders<UserModel>.Filter.Eq(u => u.Id, objectId.ToString()),
                targetUser);
            
            var newToken = _authService.GenerateJwtToken(
                targetUser.Username,
                targetUser.Email,
                targetUser.Role,
                targetUser.Id);

            return (new Dictionary<string, object>
            {
                ["message"] = "PROFILE_UPDATED",
                ["token"] = newToken.token
            }, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user profile");
            return (null, "SERVER_ERROR");
        }
    }

    public async Task<(string? id, string? error)> GetThisUserIdAsync(ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUser = await _authService.GetUserFromClaimsAsync(userClaims);

            if (currentUser == null || string.IsNullOrWhiteSpace(currentUser.Id))
                return (null, "INVALID_CREDENTIALS");
        
            return (currentUser.Id, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user id");
            return (null, "SERVER_ERROR");
        }
    }
    
    public async Task<(UserRole? role, string? error)> GetThisUserRoleAsync(ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUser = await _authService.GetUserFromClaimsAsync(userClaims);

            if (currentUser == null || string.IsNullOrWhiteSpace(currentUser.Role.ToString()))
                return (null, "INVALID_CREDENTIALS");
        
            return (currentUser.Role, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user role");
            return (null, "SERVER_ERROR");
        }
    }
}