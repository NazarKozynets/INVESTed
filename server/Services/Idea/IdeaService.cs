using System.Security.Claims;
using MongoDB.Driver;
using server.Models.DTO.Idea;
using server.Models.DTO.Profile;
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
        _ideasCollection = mongoDbService.GetCollection<IdeaModel>("Ideas");
        ;
        _logger = logger;
        _authService = authService;
        _profileService = profileService;
    }

    public async Task<(string? createdIdeaId, string? error)> StartIdeaAsync(StartIdeaModel data,
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

            var isNameTaken = await _ideasCollection
                .Find(Builders<IdeaModel>.Filter.Eq(i => i.IdeaName, data.IdeaName))
                .AnyAsync();

            if (isNameTaken)
            {
                _logger.LogWarning("Attempt to create idea with already taken name: {IdeaName}", data.IdeaName);
                return (null, "IDEA_NAME_TAKEN");
            }

            IdeaModel ideaObj;

            try
            {
                ideaObj = IdeaStrategyFactory
                    .GetIdeaStrategy(currentUserRole)
                    .StartIdea(data, data.CreatorId ?? currentUserId);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation failed while creating idea: {IdeaName}", data.IdeaName);
                return (null, ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in strategy while creating idea: {IdeaName}", data.IdeaName);
                return (null, "SERVER_ERROR");
            }

            try
            {
                await _ideasCollection.InsertOneAsync(ideaObj);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while inserting idea: {IdeaName}", data.IdeaName);
                return (null, "SERVER_ERROR");
            }

            return (ideaObj.Id, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled error in StartIdeaAsync for idea: {IdeaName}", data.IdeaName);
            return (null, "SERVER_ERROR");
        }
    }

    public async Task<(IEnumerable<GetIdeaResponseModel>?, string? error)> GetAllUserIdeasAsync(string creatorId,
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

            var filter = Builders<IdeaModel>.Filter.Eq(idea => idea.CreatorId, creatorId);
            var ideas = await _ideasCollection.Find(filter).ToListAsync();

            return (IdeaStrategyFactory.GetIdeaStrategy(currentUserRole.role.Value)
                .GetAllUserIdeas(ideas, currentUserId.id == creatorId), null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in GetAllUserIdeasAsync for creatorId: {creatorId}", creatorId);
            return (null, "SERVER_ERROR");
        }
    }

    public async Task<(IEnumerable<GetIdeaResponseModel>? ideas, int total, string? error)>
        GetLimitedAmountOfSortedIdeasAsync(
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

            var sortField = sortBy switch
            {
                "Rating" => Builders<IdeaModel>.Sort,
                "CreatedAt" => Builders<IdeaModel>.Sort,
                "TargetAmount" => Builders<IdeaModel>.Sort,
                "AlreadyCollected" => Builders<IdeaModel>.Sort,
                "FundingDeadline" => Builders<IdeaModel>.Sort,
                _ => Builders<IdeaModel>.Sort
            };

            SortDefinition<IdeaModel> sortDefinition = sortBy switch
            {
                "Rating" => sortDirection == 1
                    ? sortField.Ascending(i => i.Rating)
                    : sortField.Descending(i => i.Rating),

                "CreatedAt" => sortDirection == 1
                    ? sortField.Ascending(i => i.CreatedAt)
                    : sortField.Descending(i => i.CreatedAt),

                "TargetAmount" => sortDirection == 1
                    ? sortField.Ascending(i => i.TargetAmount)
                    : sortField.Descending(i => i.TargetAmount),

                "AlreadyCollected" => sortDirection == 1
                    ? sortField.Ascending(i => i.AlreadyCollected)
                    : sortField.Descending(i => i.AlreadyCollected),

                "FundingDeadline" => sortDirection == 1
                    ? sortField.Ascending(i => i.FundingDeadline)
                    : sortField.Descending(i => i.FundingDeadline),

                _ => sortDirection == 1
                    ? sortField.Ascending(i => i.Rating)
                    : sortField.Descending(i => i.Rating)
            };

            var filter = Builders<IdeaModel>.Filter.Empty;

            var total = await _ideasCollection.CountDocumentsAsync(filter);

            var ideas = await _ideasCollection
                .Find(filter)
                .Sort(sortDefinition)
                .Skip((page - 1) * limit)
                .Limit(limit)
                .ToListAsync();

            foreach (var idea in ideas)
            {
                var (data, error) = await _profileService.GetUserProfileByIdAsync(idea.CreatorId, userClaims);
                if (error == null && data is GetUserProfileModel profile)
                {
                    idea.CreatorUsername = profile.Username;
                }
                else
                {
                    idea.CreatorUsername = null;
                }
            }

            var ideasToReturn = IdeaStrategyFactory
                .GetIdeaStrategy(currentUserRole.role.Value)
                .GetFormattedIdeas(ideas);

            return (ideasToReturn, (int)total, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error in GetSortedIdeasAsync");
            return (null, 0, "SERVER_ERROR");
        }
    }

    public async Task<(bool res, string? error)> RateIdeaAsync(RateIdeaRequestModel data, ClaimsPrincipal userClaims)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(data.IdeaId))
                return (false, "INVALID_ID");

            var idea = await _ideasCollection.Find(Builders<IdeaModel>.Filter.Eq(i => i.Id, data.IdeaId)).FirstOrDefaultAsync();
            if (idea == null) return (false, "NOT_FOUND");
            
            var currentUserRole = await _profileService.GetThisUserRoleAsync(userClaims);
            if (currentUserRole.error != null || currentUserRole.role == null)
                return (false, currentUserRole.error);

            var strategy = IdeaStrategyFactory.GetIdeaStrategy(currentUserRole.role.Value);
                        
            var result = strategy.RateIdea(idea, data.Rate, data.RatedBy);
            return result switch
            {
                RateIdeaResult.Success => (true, null),
                RateIdeaResult.AlreadyRated => (false, "ALREADY_RATED"),
                RateIdeaResult.EmptyRatedBy => (false, "EMPTY_RATED_BY"),
                RateIdeaResult.InvalidRating => (false, "INVALID_RATING"),
                _ => (false, "UNKNOWN_ERROR")
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error in RateIdeaAsync");
            return (false, e.Message);
        }
    }
}

public enum RateIdeaResult
{
    Success,
    AlreadyRated,
    EmptyRatedBy,
    InvalidRating
}
