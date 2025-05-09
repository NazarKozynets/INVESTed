using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using server.Models.DTO.Idea;
using server.Services.Idea;

namespace server.Controllers.Idea;

[Route("api/idea")]
[Authorize]
[ApiController]
public class IdeaController : ControllerBase
{
    private readonly IdeaService _ideaService;
    private ILogger<IdeaController> _logger;

    public IdeaController(IdeaService ideaService, ILogger<IdeaController> logger)
    {
        _ideaService = ideaService;
        _logger = logger;
    }
    
    [HttpPost("start")]
    public async Task<ActionResult<object>> StartIdea(StartIdeaModel data)
    {
        var (createdIdeaId, error) = await _ideaService.StartIdeaAsync(data, User);

        if (error != null)
        {
            return error switch
            {
                "IDEA_NAME_TAKEN" => Conflict(new { error }),
                "SERVER_ERROR" => StatusCode(500, new { error }),
                _ => StatusCode(500, new { error }),
            };
        }

        return !string.IsNullOrWhiteSpace(createdIdeaId) ? Ok(new { id = createdIdeaId }) : StatusCode(500, new { error = "SERVER_ERROR" });
    }
}