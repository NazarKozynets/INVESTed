using System.Security.Claims;
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using MongoDB.Bson;
using MongoDB.Driver;
using server.Enums;
using server.Models.DTO.Forum;
using server.Models.DTO.Profile;
using server.Models.Factories;
using server.Models.Forum;
using server.services.auth;
using server.Services.DataBase;
using server.Services.Profile;

namespace server.Services.Forum;

public class ForumService
{
    private readonly IMongoCollection<ForumModel> _forumsCollection;
    private readonly ILogger<ForumService> _logger;
    private readonly ProfileService _profileService;
    private readonly AuthService _authService;
    private readonly IDistributedCache _cache;

    public ForumService(
        MongoDbService mongoDbService,
        ILogger<ForumService> logger,
        ProfileService profileService,
        AuthService authService,
        IDistributedCache cache)
    {
        _forumsCollection = mongoDbService.GetCollection<ForumModel>("Forums");
        _logger = logger;
        _profileService = profileService;
        _authService = authService;
        _cache = cache;
    }

    public async Task<(string? createdForumId, string? error)> CreateForumAsync(CreateForumModel data,
        ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUserIdResult = await _profileService.GetThisUserIdAsync(userClaims);
            if (currentUserIdResult.error != null || currentUserIdResult.id == null)
                return (null, currentUserIdResult.error);

            var currentUserRoleResult = await _profileService.GetThisUserRoleAsync(userClaims);
            if (currentUserRoleResult.error != null || currentUserRoleResult.role == null)
                return (null, currentUserRoleResult.error);

            var currentUserId = currentUserIdResult.id;
            var currentUserRole = currentUserRoleResult.role.Value;

            var isTitleTaken = await _forumsCollection
                .Find(Builders<ForumModel>.Filter.Eq(i => i.Title, data.ForumTitle))
                .AnyAsync();

            if (isTitleTaken)
            {
                _logger.LogWarning("Attempt to create forum with already taken name: {ForumTitle}", data.ForumTitle);
                return (null, "FORUM_TITLE_TAKEN");
            }

            (ForumModel? createdForum, CreateForumResult resMessage) = ForumStrategyFactory
                .GetForumStrategy(currentUserRole)
                .CreateForum(data, data.CreatorId ?? currentUserId);

            if (createdForum != null && resMessage == CreateForumResult.Success)
            {
                try
                {
                    await _forumsCollection.InsertOneAsync(createdForum);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while inserting idea: {ForumTitle}", data.ForumTitle);
                    return (null, "SERVER_ERROR");
                }
            }

            return resMessage switch
            {
                CreateForumResult.Success => (createdForum.Id, null),
                CreateForumResult.InvalidTitle => (null, "INVALID_TITLE"),
                CreateForumResult.InvalidCreatorId => (null, "INVALID_CREATOR_ID"),
                CreateForumResult.InvalidDescription => (null, "INVALID_DESCRIPTION"),
                CreateForumResult.UnknownError => (null, "UNKNOWN_ERROR"),
                _ => (null, "UNKNOWN_ERROR")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error in CreateForumAsync for forum: {ForumTitle}", data.ForumTitle);
            return (null, "SERVER_ERROR");
        }
    }

    public async Task<(List<SearchForumModel> ideas, int total, string? error)> SearchForumsAsync(
        string query, int limit, ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUserId = await _profileService.GetThisUserIdAsync(userClaims);
            if (currentUserId.error != null || currentUserId.id == null)
                return (null, 0, currentUserId.error);

            var currentUserRole = await _profileService.GetThisUserRoleAsync(userClaims);
            if (currentUserRole.error != null || currentUserRole.role == null)
                return (null, 0, currentUserRole.error);

            if (limit < 1)
                return (null, 0, "INVALID_PARAMETERS");

            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
                return (null, 0, "INVALID_QUERY");

            string cacheKey = $"search:forums:{query.ToLower()}:{limit}";
            var cachedResult = await _cache.GetStringAsync(cacheKey);

            if (!string.IsNullOrEmpty(cachedResult))
            {
                try
                {
                    var cached = JsonSerializer.Deserialize<(List<SearchForumModel>, int)>(cachedResult);
                    if (cached.Item1 != null)
                        return (cached.Item1, cached.Item2, null);
                }
                catch (Exception e)
                {
                    _logger.LogWarning(e, $"Error deserializing cache by key {cacheKey}");
                    await _cache.RemoveAsync(cacheKey);
                }
            }

            var filter = Builders<ForumModel>.Filter.And(
                Builders<ForumModel>.Filter.Regex(i => i.Title, new BsonRegularExpression(query, "i")),
                Builders<ForumModel>.Filter.Eq(i => i.Status, ForumStatus.Open)
            );

            var forums = await _forumsCollection
                .Find(filter)
                .Limit(limit)
                .Project(i => new SearchForumModel
                {
                    Id = i.Id,
                    ForumTitle = i.Title,
                    CreatorId = i.CreatorId
                })
                .ToListAsync();

            var creatorIds = forums.Select(i => i.CreatorId).Distinct().ToList();

            var usersDict = await _profileService.GetUsernamesByIdsAsync(creatorIds);

            foreach (var forum in forums)
            {
                forum.CreatorUsername = usersDict.TryGetValue(forum.CreatorId, out var username)
                    ? username
                    : "Unknown";
            }

            var total = (int)await _forumsCollection.CountDocumentsAsync(filter);

            if (forums != null && forums.Count > 0)
            {
                await _cache.SetStringAsync(
                    cacheKey,
                    JsonSerializer.Serialize((forums, total)),
                    new DistributedCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                    });
            }

            return (forums, total, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in SearchForumsAsync");
            return (null, 0, "SERVER_ERROR");
        }
    }

    public async Task<(IEnumerable<GetForumResponseModel>? forumsToReturn, string? error)> GetAllUserForumsAsync(
        string creatorId,
        ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUserId = await _profileService.GetThisUserIdAsync(userClaims);
            if (currentUserId.error != null || currentUserId.id == null)
                return (null, currentUserId.error);

            var currentUserRole = await _profileService.GetThisUserRoleAsync(userClaims);
            if (currentUserRole.error != null || currentUserRole.role == null)
                return (null, currentUserRole.error);

            var filter = Builders<ForumModel>.Filter.Eq(idea => idea.CreatorId, creatorId);
            var forums = await _forumsCollection.Find(filter).ToListAsync();

            return (ForumStrategyFactory.GetForumStrategy(currentUserRole.role.Value)
                .GetAllUserForums(forums, currentUserId.id == creatorId), null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in GetAllUserForumsAsync for creatorId: {creatorId}", creatorId);
            return (null, "SERVER_ERROR");
        }
    }

    public async Task<(GetForumResponseModel? forumToReturn, string? error)> GetForumByIdAsync(string forumId,
        ClaimsPrincipal userClaims)
    {
        try
        {
            if (string.IsNullOrEmpty(forumId)) return (null, "INVALID_ID");

            ForumModel forum = await _forumsCollection.Find(forum => forum.Id == forumId).FirstOrDefaultAsync();
            if (forum == null) return (null, "NOT_FOUND");

            var currentUserId = await _profileService.GetThisUserIdAsync(userClaims);
            if (currentUserId.error != null || currentUserId.id == null)
                return (null, currentUserId.error);

            var currentUserRole = await _profileService.GetThisUserRoleAsync(userClaims);
            if (currentUserRole.error != null || currentUserRole.role == null)
                return (null, currentUserRole.error);

            var (username, error) = await _profileService.GetUsernameById(forum.CreatorId);
            if (error == null && !string.IsNullOrEmpty(username))
            {
                forum.CreatorUsername = username;
            }
            else
            {
                forum.CreatorUsername = null;
            }

            return (ForumStrategyFactory
                .GetForumStrategy(currentUserRole.role.Value)
                .GetFormattedForum(forum, currentUserId.id == forum.CreatorId), null);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error in GetForumByIdAsync");
            return (null, "SERVER_ERROR");
        }
    }
    
    public async Task<(IEnumerable<GetForumResponseModel>? forums, int total, string? error)>
        GetLimitedAmountOfSortedForumsAsync(
            int page,
            int limit,
            string sortBy,
            string sortOrder,
            ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUserId = await _profileService.GetThisUserIdAsync(userClaims);
            if (currentUserId.error != null || currentUserId.id == null)
                return (null, 0, currentUserId.error);

            var currentUserRole = await _profileService.GetThisUserRoleAsync(userClaims);
            if (currentUserRole.error != null || currentUserRole.role == null)
                return (null, 0, currentUserRole.error);

            if (page < 1 || limit < 1)
                return (null, 0, "INVALID_PARAMETERS");

            var sortDirection = sortOrder.ToLower() == "asc" ? 1 : -1;

            SortDefinition<ForumModel> sortDefinition;
            FilterDefinition<ForumModel> filter;

            if (sortBy == "CreatedAt")
            {
                sortDefinition = sortDirection == 1
                    ? Builders<ForumModel>.Sort.Ascending(i => i.CreatedAt)
                    : Builders<ForumModel>.Sort.Descending(i => i.CreatedAt);

                filter = Builders<ForumModel>.Filter.Eq(i => i.Status, ForumStatus.Open);
            }
            else if (sortBy == "Status")
            {
                sortDefinition = sortDirection == 1
                    ? Builders<ForumModel>.Sort.Ascending(i => i.Status)
                    : Builders<ForumModel>.Sort.Descending(i => i.Status);

                filter = Builders<ForumModel>.Filter.Empty;
            }
            else
            {
                _logger.LogError("INVALID SORT BY {sortBy}: {sortOrder}", sortBy, sortOrder);
                return (null, 0, "INVALID_SORT_BY");
            }

            var total = await _forumsCollection.CountDocumentsAsync(filter);

            var forums = await _forumsCollection
                .Find(filter)
                .Sort(sortDefinition)
                .Skip((page - 1) * limit)
                .Limit(limit)
                .ToListAsync();

            foreach (var forum in forums)
            {
                var (data, error) = await _profileService.GetUserProfileByIdAsync(forum.CreatorId, userClaims);
                forum.CreatorUsername = error == null && data is GetUserProfileModel profile
                    ? profile.Username
                    : null;
            }

            var formattedForums = ForumStrategyFactory
                .GetForumStrategy(currentUserRole.role.Value)
                .GetFormattedForums(forums);

            return (formattedForums, (int)total, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in GetSortedForumsAsync");
            return (null, 0, "SERVER_ERROR");
        }
    }
    
    public async Task<(ForumCommentModel? createdComment, string? error)> AddCommentToForumAsync(
        AddCommentToForumModel data, ClaimsPrincipal userClaims)
    {
        _logger.LogInformation("AddCommentToForumAsync started");
        _logger.LogInformation("AddCommentToForumAsync: {data}", JsonSerializer.Serialize(data));
        try
        {
            if (string.IsNullOrWhiteSpace(data.ForumId))
                return (null, "INVALID_ID");

            var forum = await _forumsCollection.Find(Builders<ForumModel>.Filter.And(
                    Builders<ForumModel>.Filter.Eq(i => i.Id, data.ForumId),
                    Builders<ForumModel>.Filter.Eq(i => i.Status, ForumStatus.Open)
                ))
                .FirstOrDefaultAsync();
            if (forum == null) return (null, "NOT_FOUND");

            var currentUser = await _authService.GetUserFromClaimsAsync(userClaims);
            if (currentUser == null || string.IsNullOrEmpty(currentUser.Id) ||
                string.IsNullOrEmpty(currentUser.Username)) return (null, "INVALID_CREDENTIALS");

            var strategy = ForumStrategyFactory.GetForumStrategy(currentUser.Role);

            var result = strategy.AddCommentToForum(forum, data.CommentText, currentUser.Id, currentUser.Username);

            if (result is { newComment: not null, resultMes: CommentForumResult.Success })
            {
                var update = Builders<ForumModel>.Update.Push(i => i.Comments, result.newComment);
                var updateResult = await _forumsCollection.UpdateOneAsync(
                    Builders<ForumModel>.Filter.Eq(i => i.Id, forum.Id),
                    update
                );

                if (updateResult.MatchedCount == 0)
                {
                    _logger.LogWarning("Failed to update forum with ID {ForumId}: Not found in database", forum.Id);
                    return (null, "UPDATE_FAILED");
                }
            }

            return result.resultMes switch
            {
                CommentForumResult.Success => (result.newComment, null),
                CommentForumResult.EmptyComment => (null, "EMPTY_COMMENT"),
                CommentForumResult.EmptyCommentedBy => (null, "EMPTY_COMMENT_BY"),
                CommentForumResult.CommentTooLong => (null, "COMMENT_TOO_LONG"),
                CommentForumResult.NotEnoughAccess => (null, "UNABLE_TO_COMMENT"),
                _ => (null, "SERVER_ERROR")
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error in AddCommentToForumAsync");
            return (null, e.Message);
        }
    }
    
        public async Task<(bool? res, string? error)> DeleteCommentFromForumAsync(string commentId,
        ClaimsPrincipal userClaims)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(commentId))
                return (null, "INVALID_ID");

            var currentUser = await _authService.GetUserFromClaimsAsync(userClaims);
            if (currentUser == null || string.IsNullOrEmpty(currentUser.Id) ||
                string.IsNullOrEmpty(currentUser.Username)) return (null, "INVALID_CREDENTIALS");

            var filter = Builders<ForumModel>.Filter.And(
                Builders<ForumModel>.Filter.ElemMatch(i => i.Comments, c => c.Id == commentId),
                Builders<ForumModel>.Filter.Eq(i => i.Status, ForumStatus.Open)
            );

            var forum = await _forumsCollection.Find(filter).FirstOrDefaultAsync();
            if (forum == null) return (null, "NOT_FOUND");

            ForumCommentModel comment = forum.Comments.FirstOrDefault(c => c.Id == commentId);

            if (comment == null)
                return (null, "COMMENT_NOT_FOUND");

            var strategy = ForumStrategyFactory.GetForumStrategy(currentUser.Role);

            bool canDelete = strategy.CanDeleteCommentFromForum(comment.CommentatorId, currentUser.Id);

            if (!canDelete) return (null, "NOT_ENOUGH_ACCESS");

            var update = Builders<ForumModel>.Update.PullFilter(
                i => i.Comments,
                c => c.Id == commentId
            );

            var updateResult = await _forumsCollection.UpdateOneAsync(
                Builders<ForumModel>.Filter.Eq(i => i.Id, forum.Id),
                update
            );

            if (updateResult.ModifiedCount == 0)
                return (false, "DELETE_FAILED");

            return (true, null);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error in DeleteCommentFromForumAsync");
            return (false, e.Message);
        }
    }
}