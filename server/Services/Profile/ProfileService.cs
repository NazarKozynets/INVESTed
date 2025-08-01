using MongoDB.Driver;
using server.Models.Factories;
using server.models.user;
using server.Services.DataBase;
using System.Security.Claims;
using MongoDB.Bson;
using server.Models.DTO.Profile;
using server.Models.Forum;
using server.Models.Idea;
using server.services.auth;

namespace server.Services.Profile;

public class ProfileService
{
    private readonly IMongoCollection<UserModel> _usersCollection;
    private readonly IMongoCollection<IdeaModel> _ideasCollection;
    private readonly IMongoCollection<ForumModel> _forumsCollection;
    private readonly ILogger<ProfileService> _logger;
    private readonly AuthService _authService;

    public ProfileService(
        MongoDbService mongoDbService,
        ILogger<ProfileService> logger,
        AuthService authService)
    {
        _usersCollection = mongoDbService.GetCollection<UserModel>("Users");
        _ideasCollection = mongoDbService.GetCollection<IdeaModel>("Ideas");
        _forumsCollection = mongoDbService.GetCollection<ForumModel>("Forums");
        _logger = logger;
        _authService = authService;
    }

    public async Task<(object? data, string? error)> GetUserProfileByUsernameAsync(string username,
        ClaimsPrincipal userClaims)
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

            var (averageIdeaRating, errorGettingAverageIdeaRating) = await GetUserAverageIdeaRating(targetUser.Id);
            if (errorGettingAverageIdeaRating == null)
            {
                profileData.AverageIdeaRating = averageIdeaRating;
            }

            var (totalIdeasAmount, errorGettingTotalIdeasAmount) = await GetUserTotalIdeasAmount(targetUser.Id);
            if (errorGettingTotalIdeasAmount == null)
            {
                profileData.TotalIdeasAmount = totalIdeasAmount;
            }
            
            var (totalFunding, errorGettingTotalFunding) = await GetUserTotalFunding(targetUser.Id);
            if (errorGettingTotalFunding == null)
            {
                profileData.TotalFunding = totalFunding;
            }
            
            var (totalForumsAmount, errorGettingTotalForumsAmount) = await GetUserTotalForumsAmount(targetUser.Id);
            if (errorGettingTotalForumsAmount == null)
            {
                profileData.TotalForumsAmount = totalForumsAmount;
            }

            var (totalClosedForumsAmount, errorGettingTotalClosedForumsAmount) = await GetUserTotalClosedForumsAmount(targetUser.Id);
            if (errorGettingTotalClosedForumsAmount == null)
            {
                profileData.TotalClosedForumsAmount = totalClosedForumsAmount;
            }
            
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

            if (string.IsNullOrWhiteSpace(data.Username) && string.IsNullOrWhiteSpace(data.Email) && string.IsNullOrWhiteSpace(data.AvatarUrl))
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
                targetUser.AvatarUrl!,
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
    
    public async Task<(string? username, string? error)> GetUsernameById(string id)
    {
        try
        {
            var user = await _usersCollection.Find(u => u.Id == id).FirstOrDefaultAsync();
            
            if (user == null) return (null, "USER_NOT_FOUND");

            return (user.Username, null);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting username by id");
            return (null, "SERVER_ERROR");
        }
    }
    
    public async Task<Dictionary<string, string>> GetUsernamesByIdsAsync(List<string> ids)
    {
        var users = await _usersCollection
            .Find(u => ids.Contains(u.Id))
            .Project(u => new { u.Id, u.Username })
            .ToListAsync();

        return users.ToDictionary(u => u.Id, u => u.Username);
    }

    public async Task<(string? avatarUrl, string? error)> GetAvatarUrlById(string id)
    {
        try
        {
            var user = await _usersCollection.Find(u => u.Id == id).FirstOrDefaultAsync();
            
            if (user == null) return (null, "USER_NOT_FOUND");

            return (user.AvatarUrl, null);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting avatar by id");
            return (null, "SERVER_ERROR");
        }
    }
    
    public async Task<Dictionary<string, string?>> GetAvatarUrlsByIdsAsync(List<string> ids)
    {
        var users = await _usersCollection
            .Find(u => ids.Contains(u.Id))
            .Project(u => new { u.Id, u.AvatarUrl })
            .ToListAsync();

        return users.ToDictionary(u => u.Id, u => u.AvatarUrl);
    }

    public async Task<(double? averageIdeaRating, string? error)> GetUserAverageIdeaRating(string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
                return (null, "INVALID_ID");

            var userIdeas = await _ideasCollection
                .Find(i => i.CreatorId == userId)
                .ToListAsync();

            if (userIdeas.Count == 0)
                return (0.0, null);

            var allRatings = userIdeas
                .SelectMany(i => i.Rating)
                .Select(r => r.Rate)
                .ToList();

            if (allRatings.Count == 0)
                return (0.0, null);

            double avgRating = allRatings.Average();

            return (avgRating, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user average idea rating");
            return (null, "SERVER_ERROR");
        }
    }

    public async Task<(int? totalIdeasAmount, string? error)> GetUserTotalIdeasAmount(string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
                return (null, "INVALID_ID");

            var userIdeas = (await _ideasCollection
                .Find(i => i.CreatorId == userId)
                .ToListAsync()).Count;

            return (userIdeas, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user total ideas amount");
            return (null, "SERVER_ERROR");
        }
    }

    public async Task<(decimal? totalFundings, string? error)> GetUserTotalFunding(string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
                return (null, "INVALID_ID");

            var userIdeas = await _ideasCollection
                .Find(i => i.CreatorId == userId)
                .ToListAsync();

            decimal totalFunding = userIdeas
                .SelectMany(i => i.FundingHistory)
                .Sum(fh => fh.FundingAmount);

            return (totalFunding, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user total fundings");
            return (null, "SERVER_ERROR");
        }
    }
    
    public async Task<(int? totalIdeasAmount, string? error)> GetUserTotalForumsAmount(string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
                return (null, "INVALID_ID");

            var userForumsCount = (await _forumsCollection
                .Find(f => f.CreatorId == userId)
                .ToListAsync()).Count;

            return (userForumsCount, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user total forums amount");
            return (null, "SERVER_ERROR");
        }
    }
    
    public async Task<(int? totalIdeasAmount, string? error)> GetUserTotalClosedForumsAmount(string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
                return (null, "INVALID_ID");

            var userForumsCount = (await _forumsCollection
                .Find(f => f.CreatorId == userId && f.Status == ForumStatus.Closed)
                .ToListAsync()).Count;

            return (userForumsCount, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user total closed forums amount");
            return (null, "SERVER_ERROR");
        }
    }
}