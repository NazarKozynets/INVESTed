using System.Security.Claims;
using MongoDB.Driver;
using server.Enums;
using server.Models.DTO.Forum;
using server.Models.Factories;
using server.Models.Forum;
using server.Models.Idea;
using server.Models.Strategies.Forum;
using server.models.user;
using server.services.auth;
using server.Services.DataBase;
using server.Services.Profile;

namespace server.Services.Forum;

public class ForumService
{
    private readonly IMongoCollection<ForumModel> _forumsCollection;
    private readonly ILogger<ForumService> _logger;
    private readonly ProfileService _profileService;

    public ForumService(
        MongoDbService mongoDbService,
        ILogger<ForumService> logger,
        ProfileService profileService,
        AuthService authService)
    {
        _forumsCollection = mongoDbService.GetCollection<ForumModel>("Forums");
        _logger = logger;
        _profileService = profileService;
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
}