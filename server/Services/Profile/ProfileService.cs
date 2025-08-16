using MongoDB.Driver;
using server.Models.Factories;
using server.models.user;
using server.Services.DataBase;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
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
    private readonly IDistributedCache _cache;

    public ProfileService(
        MongoDbService mongoDbService,
        ILogger<ProfileService> logger,
        IDistributedCache cache,
        AuthService authService)
    {
        _usersCollection = mongoDbService.GetCollection<UserModel>("Users");
        _ideasCollection = mongoDbService.GetCollection<IdeaModel>("Ideas");
        _forumsCollection = mongoDbService.GetCollection<ForumModel>("Forums");
        _logger = logger;
        _cache = cache;
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

            var (totalClosedForumsAmount, errorGettingTotalClosedForumsAmount) =
                await GetUserTotalClosedForumsAmount(targetUser.Id);
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

            if (targetUser.IsBanned)
                return (null, "UPDATE_BANNED_ACCOUNT");

            var strategy = ProfileStrategyFactory.GetProfileStrategy(currentUser.Role);

            if (!strategy.CanUpdateProfile(currentUser.Id == targetUser.Id))
                return (null, "UNAUTHORIZED");

            if (string.IsNullOrWhiteSpace(data.Username) && string.IsNullOrWhiteSpace(data.Email) &&
                string.IsNullOrWhiteSpace(data.AvatarUrl))
                return (null, "EMPTY_DATA");

            if (data.Username != null && await _usersCollection.Find(u => u.Username == data.Username).AnyAsync())
                return (null, "EXISTING_USERNAME");

            if (data.Email != null && await _usersCollection.Find(u => u.Email == data.Email).AnyAsync())
                return (null, "EXISTING_EMAIL");

            strategy.UpdateProfile(targetUser, data);

            await _usersCollection.ReplaceOneAsync(
                Builders<UserModel>.Filter.Eq(u => u.Id, objectId.ToString()),
                targetUser);

            if (currentUser.Id == targetUser.Id)
            {
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
            else
            {
                return (new Dictionary<string, object>
                {
                    ["message"] = "PROFILE_UPDATED",
                }, null);
            }
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

    public async Task<(bool? isBanned, string? error)> GetUserBanStatusById(string id)
    {
        try
        {
            var user = await _usersCollection.Find(u => u.Id == id).FirstOrDefaultAsync();

            if (user == null) return (null, "USER_NOT_FOUND");

            return (user.IsBanned, null);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error getting ban status by id");
            return (null, "SERVER_ERROR");
        }
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

    public async Task<(bool res, bool? newStatus, string? error)> ChangeUserBanStatusAsync(string userId,
        ClaimsPrincipal userClaims)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
                return (false, null, "INVALID_ID");

            var userToUpdate = await _usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();

            if (userToUpdate == null)
                return (false, null, "USER_NOT_FOUND");

            var currentUserRole = await GetThisUserRoleAsync(userClaims);
            if (currentUserRole.error != null || currentUserRole.role == null)
                return (false, null, currentUserRole.error);

            if (userToUpdate.Role == UserRole.Admin && currentUserRole.role == UserRole.Admin)
                return (false, null, "ADMIN_ADMIN");

            bool canBan = ProfileStrategyFactory.GetProfileStrategy(currentUserRole.role.Value).CanBanUser();

            if (!canBan)
                return (false, null, "NOT_ENOUGH_ACCESS");

            var update = Builders<UserModel>.Update.Set(u => u.IsBanned, !userToUpdate.IsBanned);

            var updatedUser = await _usersCollection.FindOneAndUpdateAsync(
                u => u.Id == userId,
                update,
                new FindOneAndUpdateOptions<UserModel> { ReturnDocument = ReturnDocument.After });

            if (updatedUser == null)
                return (false, null, "SERVER_ERROR");

            return (true, updatedUser.IsBanned, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing {userId} ban status", userId);
            return (false, null, "SERVER_ERROR");
        }
    }

    public async Task<(bool res, string? error)> UpdateUserRoleAsync(UpdateUserRoleModel data,
        ClaimsPrincipal userClaims)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(data.Id))
                return (false, "INVALID_ID");
            if (!Enum.IsDefined(typeof(UserRole), data.NewRole))
                return (false, "INVALID_ROLE");

            var userToUpdate = await _usersCollection.Find(u => u.Id == data.Id).FirstOrDefaultAsync();

            if (userToUpdate == null)
                return (false, "USER_NOT_FOUND");

            var currentUserRole = await GetThisUserRoleAsync(userClaims);
            if (currentUserRole.error != null || currentUserRole.role == null)
                return (false, currentUserRole.error);

            bool canUpdateRole = ProfileStrategyFactory.GetProfileStrategy(currentUserRole.role.Value)
                .CanUpdateRole(userToUpdate.Role, data.NewRole);

            if (!canUpdateRole)
                return (false, "NOT_ENOUGH_ACCESS");

            var update = Builders<UserModel>.Update.Set(u => u.Role, data.NewRole);

            var updateResult = await _usersCollection.UpdateOneAsync(
                Builders<UserModel>.Filter.Eq(u => u.Id, data.Id),
                update
            );

            if (updateResult.IsModifiedCountAvailable && updateResult.ModifiedCount == 0)
            {
                _logger.LogWarning("Failed to update user with ID {UserId}: modified count = 0", data.Id);
                return (false, "UPDATE_FAILED");
            }

            return (true, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating {userId} user role", data.Id);
            return (false, "SERVER_ERROR");
        }
    }

    public async Task<(IEnumerable<GetUserProfileModel>? clients, string? error)> GetClientsAsync(ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUserId = await GetThisUserIdAsync(userClaims);
            if (currentUserId.error != null || currentUserId.id == null)
                return (null, currentUserId.error);

            var currentUserRole = await GetThisUserRoleAsync(userClaims);
            if (currentUserRole.error != null || currentUserRole.role == null)
                return (null, currentUserRole.error);

            if (currentUserRole.role.Value != UserRole.Admin)
                return (null, "NOT_ENOUGH_ACCESS");

            var filter = Builders<UserModel>.Filter.Ne(u => u.Role, UserRole.Admin);
            var clients = await _usersCollection.Find(filter).ToListAsync();

            var formattedClients = ProfileStrategyFactory
                .GetProfileStrategy(currentUserRole.role.Value)
                .GetProfiles(clients);

            return (formattedClients, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in GetLimitedAmountOfSortedClientsAsync");
            return (null, "SERVER_ERROR");
        }
    }
    
        public async Task<(List<SearchClientsModel> clients, int total, string? error)> SearchClientsAsync(
        string query, int limit, ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUserId = await GetThisUserIdAsync(userClaims);
            if (currentUserId.error != null || currentUserId.id == null)
                return (null, 0, currentUserId.error);

            var currentUserRole = await GetThisUserRoleAsync(userClaims);
            if (currentUserRole.error != null || currentUserRole.role == null)
                return (null, 0, currentUserRole.error);

            if (limit < 1)
                return (null, 0, "INVALID_PARAMETERS");

            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                return (null, 0, "INVALID_QUERY");

            string cacheKey = $"search:clients:{query.ToLower()}:{limit}";
            var cachedResult = await _cache.GetStringAsync(cacheKey);

            if (!string.IsNullOrEmpty(cachedResult))
            {
                try
                {
                    var cached = JsonSerializer.Deserialize<(List<SearchClientsModel>, int)>(cachedResult);
                    if (cached.Item1 != null)
                        return (cached.Item1, cached.Item2, null);
                }
                catch (Exception e)
                {
                    _logger.LogWarning(e, $"Error deserializing cache by key {cacheKey}");
                    await _cache.RemoveAsync(cacheKey);
                }
            }

            var filter = Builders<UserModel>.Filter.And(
                Builders<UserModel>.Filter.Regex(i => i.Username, new BsonRegularExpression(query, "i"))
            );

            var users = await _usersCollection
                .Find(filter)
                .Limit(limit)
                .Project(i => new SearchClientsModel()
                {
                    Id = i.Id,
                    Username = i.Username,
                    AvatarUrl = i.AvatarUrl,
                    IsBanned = i.IsBanned
                })
                .ToListAsync();

            var total = (int)await _usersCollection.CountDocumentsAsync(filter);

            if (users != null && users.Count > 0)
            {
                await _cache.SetStringAsync(
                    cacheKey,
                    JsonSerializer.Serialize((users, total)),
                    new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                    });
            }

            return (users, total, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in SearchForumsAsync");
            return (null, 0, "SERVER_ERROR");
        }
    }
}