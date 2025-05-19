using MongoDB.Driver;
using server.Models.Idea;
using server.Services.DataBase;

namespace server.Services.Idea;

public class IdeaExpirationService : BackgroundService
{
    private readonly IMongoCollection<IdeaModel> _ideasCollection;
    private readonly ILogger<IdeaExpirationService> _logger;

    public IdeaExpirationService(MongoDbService mongoDbService, ILogger<IdeaExpirationService> logger)
    {
        _ideasCollection = mongoDbService.GetCollection<IdeaModel>("Ideas");
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var filter = Builders<IdeaModel>.Filter.And(
                    Builders<IdeaModel>.Filter.Eq(i => i.Status, IdeaStatus.Open),
                    Builders<IdeaModel>.Filter.Lte(i => i.FundingDeadline, DateTime.UtcNow)
                );

                var expiredIdeas = await _ideasCollection.Find(filter).ToListAsync(stoppingToken);
                
                foreach (var idea in expiredIdeas)
                {
                    _logger.LogInformation("idea name: {name}", idea.IdeaName);
                    idea.CloseIdea();
                    var update = Builders<IdeaModel>.Update.Set(i => i.Status, IdeaStatus.Closed);
                    await _ideasCollection.UpdateOneAsync(
                        Builders<IdeaModel>.Filter.Eq(i => i.Id, idea.Id),
                        update,
                        cancellationToken: stoppingToken
                    );
                    
                    _logger.LogInformation("Closed idea {IdeaId} due to expired funding deadline", idea.Id);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in IdeaExpirationService");
            }

            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
        }
    }
}