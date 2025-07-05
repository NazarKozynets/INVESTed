using System.Security.Claims;
using MongoDB.Driver;
using server.Enums;
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

    public async Task<(GetIdeaResponseModel? ideaToReturn, string? error)> GetIdeaByIdAsync(string ideaId,
        ClaimsPrincipal userClaims)
    {
        try
        {
            if (string.IsNullOrEmpty(ideaId)) return (null, "INVALID_ID");

            IdeaModel idea = await _ideasCollection.Find(idea => idea.Id == ideaId).FirstOrDefaultAsync();
            if (idea == null) return (null, "NOT_FOUND");

            var currentUser = await _authService.GetUserFromClaimsAsync(userClaims);
            if (currentUser == null || string.IsNullOrEmpty(currentUser.Id) || string.IsNullOrEmpty(currentUser.Username)) return (null, "INVALID_CREDENTIALS");

            var (data, error) = await _profileService.GetUserProfileByIdAsync(idea.CreatorId, userClaims);
            if (error == null && data is GetUserProfileModel profile)
            {
                idea.CreatorUsername = profile.Username;
            }
            else
            {
                idea.CreatorUsername = null;
            }

            return (IdeaStrategyFactory
                .GetIdeaStrategy(currentUser.Role)
                .GetFormattedIdea(idea, currentUser.Id == idea.CreatorId), null);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error in GetIdeaByIdAsync");
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

            var filter = Builders<IdeaModel>.Filter.Eq(i => i.Status, IdeaStatus.Open);

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

    public async Task<(decimal? updatedAlreadyCollected, string? error)> InvestIdeaAsync(InvestIdeaRequestModel data, ClaimsPrincipal userClaims)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(data.IdeaId))
                return (null, "INVALID_ID");
            
            var idea = await _ideasCollection.Find(Builders<IdeaModel>.Filter.And(
                    Builders<IdeaModel>.Filter.Eq(i => i.Id, data.IdeaId),
                    Builders<IdeaModel>.Filter.Eq(i => i.Status, IdeaStatus.Open)
                ))
                .FirstOrDefaultAsync();
            if (idea == null) return (null, "NOT_FOUND");

            var currentUser = await _authService.GetUserFromClaimsAsync(userClaims);
            if (currentUser == null || string.IsNullOrEmpty(currentUser.Id) || string.IsNullOrEmpty(currentUser.Username)) return (null, "INVALID_CREDENTIALS");
            
            var strategy = IdeaStrategyFactory.GetIdeaStrategy(currentUser.Role);

            var result = strategy.InvestIdea(idea, currentUser.Id, currentUser.Username, data.FundingAmount, idea.CreatorId == currentUser.Id);
            
            if (result is { updatedAlreadyCollected: not null, fundingHistoryElementModel: not null, resultMes: InvestIdeaResult.Success })
            {
                var update = Builders<IdeaModel>.Update.Combine(
                    Builders<IdeaModel>.Update.Push(i => i.FundingHistory, result.fundingHistoryElementModel),
                    Builders<IdeaModel>.Update.Set(i => i.AlreadyCollected, result.updatedAlreadyCollected)
                );

                var updateResult = await _ideasCollection.UpdateOneAsync(
                    Builders<IdeaModel>.Filter.Eq(i => i.Id, idea.Id),
                    update
                );

                if (updateResult.MatchedCount == 0)
                {
                    _logger.LogWarning("Failed to update idea with ID {IdeaId}: Not found in database", idea.Id);
                    return (null, "UPDATE_FAILED");
                }
            }

            return result.resultMes switch
            {
                InvestIdeaResult.Success => (result.updatedAlreadyCollected, null),
                InvestIdeaResult.InvalidFundingAmount => (null, "INVALID_FUNDING_AMOUNT"),
                InvestIdeaResult.EmptyFundedBy => (null, "EMPTY_FUNDED_BY"),
                InvestIdeaResult.NotEnoughAccess => (null, "UNABLE_TO_INVEST"),
                InvestIdeaResult.InvestYourIdea => (null, "INVEST_YOUR_IDEA"),
                InvestIdeaResult.FundingAmountGreaterThanTarget => (null, "FUNDING_AMOUNT_GREATER_THAN_TARGET"),
                _ => (null, "SERVER_ERROR")
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error in InvestIdeaAsync");
            return (null, e.Message);
        }
    }
    
    public async Task<(bool res, string? error)> RateIdeaAsync(RateIdeaRequestModel data, ClaimsPrincipal userClaims)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(data.IdeaId))
                return (false, "INVALID_ID");

            var idea = await _ideasCollection.Find(Builders<IdeaModel>.Filter.And(
                    Builders<IdeaModel>.Filter.Eq(i => i.Id, data.IdeaId),
                    Builders<IdeaModel>.Filter.Eq(i => i.Status, IdeaStatus.Open)
                ))
                .FirstOrDefaultAsync();
            if (idea == null) return (false, "NOT_FOUND");
            
            var currentUserIdResult = await _profileService.GetThisUserIdAsync(userClaims);
            if (currentUserIdResult.error != null || currentUserIdResult.id == null)
                return (false, currentUserIdResult.error);
            
            var currentUserRole = await _profileService.GetThisUserRoleAsync(userClaims);
            if (currentUserRole.error != null || currentUserRole.role == null)
                return (false, currentUserRole.error);

            var strategy = IdeaStrategyFactory.GetIdeaStrategy(currentUserRole.role.Value);

            var result = strategy.RateIdea(idea, data.Rate, currentUserIdResult.id, idea.CreatorId == currentUserIdResult.id);
            
            if (result is { newRate: not null, resultMes: RateIdeaResult.Success})
            {
                var update = Builders<IdeaModel>.Update.Push(i => i.Rating, result.newRate);
                var updateResult = await _ideasCollection.UpdateOneAsync(
                    Builders<IdeaModel>.Filter.Eq(i => i.Id, idea.Id),
                    update
                );

                if (updateResult.MatchedCount == 0)
                {
                    _logger.LogWarning("Failed to update idea with ID {IdeaId}: Not found in database", idea.Id);
                    return (false, "UPDATE_FAILED");
                }
            }
            
            return result.resultMes switch
            {
                RateIdeaResult.Success => (true, null),
                RateIdeaResult.AlreadyRated => (false, "ALREADY_RATED"),
                RateIdeaResult.EmptyRatedBy => (false, "EMPTY_RATED_BY"),
                RateIdeaResult.InvalidRating => (false, "INVALID_RATING"),
                RateIdeaResult.RateYourIdea => (false, "RATE_YOUR_IDEA"),
                RateIdeaResult.NotEnoughAccess => (false, "UNABLE_TO_RATE"),
                _ => (false, "UNKNOWN_ERROR")
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error in RateIdeaAsync");
            return (false, e.Message);
        }
    }

    public async Task<(IdeaCommentModel? createdComment, string? error)> AddCommentToIdeaAsync(AddCommentToIdeaModel data, ClaimsPrincipal userClaims)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(data.IdeaId))
                return (null, "INVALID_ID");

            var idea = await _ideasCollection.Find(Builders<IdeaModel>.Filter.And(
                    Builders<IdeaModel>.Filter.Eq(i => i.Id, data.IdeaId),
                    Builders<IdeaModel>.Filter.Eq(i => i.Status, IdeaStatus.Open)
                ))
                .FirstOrDefaultAsync();
            if (idea == null) return (null, "NOT_FOUND");

            var currentUser = await _authService.GetUserFromClaimsAsync(userClaims);
            if (currentUser == null || string.IsNullOrEmpty(currentUser.Id) || string.IsNullOrEmpty(currentUser.Username)) return (null, "INVALID_CREDENTIALS");
            
            var strategy = IdeaStrategyFactory.GetIdeaStrategy(currentUser.Role);

            var result = strategy.AddCommentToIdea(idea, data.CommentText, currentUser.Id, currentUser.Username);
            
            if (result is { newComment: not null, resultMes: CommentIdeaResult.Success })
            {
                var update = Builders<IdeaModel>.Update.Push(i => i.Comments, result.newComment);
                var updateResult = await _ideasCollection.UpdateOneAsync(
                    Builders<IdeaModel>.Filter.Eq(i => i.Id, idea.Id),
                    update
                );

                if (updateResult.MatchedCount == 0)
                {
                    _logger.LogWarning("Failed to update idea with ID {IdeaId}: Not found in database", idea.Id);
                    return (null, "UPDATE_FAILED");
                }
            }

            return result.resultMes switch
            {
                CommentIdeaResult.Success => (result.newComment, null),
                CommentIdeaResult.EmptyComment => (null, "EMPTY_COMMENT"),
                CommentIdeaResult.EmptyCommentedBy => (null, "EMPTY_COMMENT_BY"),
                CommentIdeaResult.CommentTooLong => (null, "COMMENT_TOO_LONG"),
                CommentIdeaResult.NotEnoughAccess => (null, "UNABLE_TO_COMMENT"),
                _ => (null, "SERVER_ERROR")
            };
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error in AddCommentToIdeaAsync");
            return (null, e.Message);
        }
    }
}