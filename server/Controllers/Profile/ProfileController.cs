using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using server.Controllers.Auth;
using server.models.user;
using server.services.auth;
using server.Services.DataBase;
using server.Services.Profile;

namespace server.Controllers.Profile;

[Route("api/profile")]
[ApiController]
public class ProfileController : ControllerBase
{
    private readonly ProfileService _profileService;
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IMongoCollection<UserModel> _usersCollection;

    public ProfileController
    (
        ProfileService profileService,
        AuthService authService,
        ILogger<AuthController> logger,
        MongoDbService mongoDbService
    )
    {
        _profileService = profileService;
        _authService = authService;
        _logger = logger;
        _usersCollection = mongoDbService.GetCollection<UserModel>("Users");
    }
}