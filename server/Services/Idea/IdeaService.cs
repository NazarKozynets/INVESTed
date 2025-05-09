using System.Security.Claims;
using MongoDB.Driver;
using server.Models.DTO.Idea;
using server.Models.Factories;
using server.Models.Idea;
using server.models.user;
using server.services.auth;
using server.Services.DataBase;
using server.Services.Profile;

namespace server.Services.Idea;

public class IdeaService
{
    private readonly IMongoCollection<IdeaModel> _ideasCollection;
    private readonly ILogger<IdeaService> _logger;
    private readonly AuthService _authService;
    private readonly ProfileService _profileService;

    public IdeaService(
        MongoDbService mongoDbService,
        ILogger<IdeaService> logger,
        AuthService authService,
        ProfileService profileService)
    {
        _ideasCollection = mongoDbService.GetCollection<IdeaModel>("Ideas");;
        _logger = logger;
        _authService = authService;
        _profileService = profileService;
    }

    public async Task<(string? createdIdeaId, string? error)> StartIdeaAsync(StartIdeaModel data, ClaimsPrincipal userClaims)
    {
        try
        {
            var currentUserId = await _profileService.GetThisUserIdAsync(userClaims);
            if (currentUserId.error != null || currentUserId.id == null) 
                return (null, currentUserId.error);
        
            var currentUserRole = await _profileService.GetThisUserRoleAsync(userClaims);
            if (currentUserRole.error != null || currentUserRole.role == null)
                return (null, currentUserRole.error);
        
            var filter = Builders<IdeaModel>.Filter.Eq(idea => idea.IdeaName, data.IdeaName);
            var isIdeaNameTaken = await _ideasCollection.Find(filter).AnyAsync();
            if (isIdeaNameTaken)
            {
                _logger.LogWarning("Attempt to create idea with already taken name: {IdeaName}", data.IdeaName);
                return (null, "IDEA_NAME_TAKEN");
            }
            
            if (data.FundingDeadline == DateTime.MinValue || data.FundingDeadline < DateTime.UtcNow)
            {
                _logger.LogWarning("Invalid funding deadline: {FundingDeadline}", data.FundingDeadline);
                return (null, "INVALID_FUNDING_DEADLINE");
            }

            var ideaObj = IdeaStrategyFactory.GetIdeaStrategy(currentUserRole.role.Value)
                .StartIdea(data, data.CreatorId ?? currentUserId.id);

            try
            {
                await _ideasCollection.InsertOneAsync(ideaObj);
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error occurred while inserting new idea: {IdeaName}", data.IdeaName);
                return (null, "SERVER_ERROR");
            }
        
            return (ideaObj.Id, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in StartIdeaAsync for idea: {IdeaName}", data.IdeaName);
            return (null, "SERVER_ERROR");
        }
    }
}