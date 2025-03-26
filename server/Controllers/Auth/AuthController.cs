using Microsoft.AspNetCore.Mvc;
using server.Models.DTO.Auth;
using server.models.user;
using server.services.auth;

namespace server.Controllers.Auth;

[Route("api/auth")]
[ApiController]
public class AuthController(AuthService authService, ILogger<AuthController> logger) : ControllerBase
{
    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterModel registerData)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(registerData.Username) || string.IsNullOrWhiteSpace(registerData.Password) || !Enum.IsDefined(registerData.Role))
            {
                logger.LogWarning("Invalid user data received for registration");
                return BadRequest(new { message = "Invalid user data" });
            }
        
            bool isRegistered = authService.RegisterNewUser(registerData);
            if (!isRegistered)
            {
                logger.LogWarning("Registration failed: User {Username} already exists", registerData.Username);
                return Conflict(new { message = "User already exists" });
            }

            string token = authService.GenerateJwtToken(registerData.Username, registerData.Role);
            logger.LogInformation("{Role} {Username} registered successfully and JWT token generated", registerData.Role, registerData.Username);

            return Ok(new
            {
                user = new { userName = registerData.Username, email = registerData.Email, role = registerData.Role },
                token
            });
        }
        catch (Exception e)
        {
            logger.LogError(e, "Registration failed");
            return BadRequest(new { message = "Registration failed" });
        }
    }
    
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginModel login)
    {
        try
        {
            logger.LogInformation("{Email} logged in", login.Email);
            if (string.IsNullOrWhiteSpace(login.Email) || string.IsNullOrWhiteSpace(login.Password))
            {
                logger.LogWarning("Invalid login data received");
                return BadRequest(new { message = "Invalid login data" });
            }

            var user = authService.AuthenticateUser(login.Email, login.Password);
            if (user == null)
            {
                logger.LogWarning("Invalid login attempt for user {Email}", login.Email);
                return Unauthorized(new { message = "Invalid username or password" });
            }

            string token = authService.GenerateJwtToken(user.Username, user.Role);
            logger.LogInformation("User {Username} logged in successfully and JWT token generated", user.Username);

            return Ok(new
            {
                user = new { userName = user.Username, email = user.Email, role = user.Role },
                token
            });
        }
        catch (Exception e)
        {
            logger.LogError(e, "Login failed");
            return BadRequest(new { message = "Login failed" });
        }
    }
}