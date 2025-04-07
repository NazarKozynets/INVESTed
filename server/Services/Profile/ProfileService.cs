using MongoDB.Driver;
using server.models.user;
using server.services.auth;
using server.Services.DataBase;

namespace server.Services.Profile;

public class ProfileService
{
    private readonly IConfiguration _configuration;
    private readonly IMongoCollection<UserModel> _usersCollection;
    private readonly ILogger<AuthService> _logger;

    public ProfileService(
        IConfiguration configuration, 
        MongoDbService mongoDbService, 
        ILogger<AuthService> logger)
    {
        _configuration = configuration;
        _usersCollection = mongoDbService.GetCollection<UserModel>("Users");
        _logger = logger;
    }
}