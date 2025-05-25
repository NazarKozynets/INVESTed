using System.Security.Claims;
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

        if (string.IsNullOrWhiteSpace(createdIdeaId))
        {
            return StatusCode(500, new { error = "SERVER_ERROR" });
        }

        return Created("idea/start", new { id = createdIdeaId });
    }

    // [AllowAnonymous]
    [HttpGet("get/all/{userId}")]
    public async Task<ActionResult<object>> GetAllUserIdeas(string userId)
    {
        var (ideas, error) = await _ideaService.GetAllUserIdeasAsync(userId, User);

        if (error != null)
        {
            return error switch
            {
                "SERVER_ERROR" => StatusCode(500, new { error }),
                _ => StatusCode(500, new { error }),
            };
        }

        return Ok(ideas);
    }

    [HttpGet("get/{ideaId}")]
    public async Task<ActionResult<object>> GetIdeaById(string ideaId)
    {
        var (idea, error) = await _ideaService.GetIdeaByIdAsync(ideaId, User);

        if (error != null)
        {
            return error switch
            {
                "INVALID_ID" => BadRequest(new { error }),
                "NOT_FOUND" => NotFound(new { error }),
                _ => StatusCode(500, new { error })
            };
        }

        return Ok(idea);
    }

    [HttpGet("get/sorted")]
    public async Task<ActionResult<object>> GetLimitedAmountOfSortedIdeas(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10,
        [FromQuery] string sortBy = "Rating",
        [FromQuery] string sortOrder = "desc")
    {
        var (ideas, total, error) =
            await _ideaService.GetLimitedAmountOfSortedIdeasAsync(page, limit, sortBy, sortOrder, User);

        if (error != null)
        {
            return error switch
            {
                "INVALID_PARAMETERS" => BadRequest(new { error }),
                "SERVER_ERROR" => StatusCode(500, new { error }),
                _ => StatusCode(500, new { error }),
            };
        }

        return Ok(new
        {
            ideas,
            total,
            page,
            limit,
            totalPages = (int)Math.Ceiling((double)total / limit)
        });
    }

    [HttpPost("invest")]
    public async Task<ActionResult<object>> InvestIdea(InvestIdeaRequestModel data)
    {
        var (res, error) = await _ideaService.InvestIdeaAsync(data, User);

        if (res == null && error != null)
        {
            return error switch
            {
                "INVALID_ID" => BadRequest(new { error }),
                "EMPTY_FUNDED_BY" => BadRequest(new { error }),
                "INVALID_FUNDING_AMOUNT" => BadRequest(new { error }),
                "NOT_FOUND" => NotFound(new { error }),
                "INVEST_YOUR_IDEA" => Conflict(new { error }),
                "UNABLE_TO_INVEST" => StatusCode(403, new { error }),
                "FUNDING_AMOUNT_GREATER_THAN_TARGET" => Conflict(new { error }),
                _ => StatusCode(500, new { error })
            };
        }
        
        return Ok(res);
    }

    [HttpPost("rate")]
    public async Task<ActionResult<object>> RateIdea(RateIdeaRequestModel data)
    {
        var (res, error) = await _ideaService.RateIdeaAsync(data, User);

        if (res == false && error != null)
        {
            return error switch
            {
                "INVALID_ID" => BadRequest(new { error }),
                "EMPTY_RATED_BY" => BadRequest(new { error }),
                "INVALID_RATING" => BadRequest(new { error }),
                "NOT_FOUND" => NotFound(new { error }),
                "ALREADY_RATED" => Conflict(new { error }),
                "RATE_YOUR_IDEA" => Conflict(new { error }),
                "UNABLE_TO_RATE" => StatusCode(403, new { error }),
                _ => StatusCode(500, new { error })
            };
        }

        return Ok();
    }

    [HttpPost("add-comment")]
    public async Task<ActionResult<object>> AddCommentToIdea(AddCommentToIdeaModel data)
    {
        var (res, error) = await _ideaService.AddCommentToIdeaAsync(data, User);

        if (res == null && error != null)
        {
            return error switch
            {
                "INVALID_ID" => BadRequest(new { error }),
                "EMPTY_COMMENT" => BadRequest(new { error }),
                "EMPTY_COMMENT_BY" => BadRequest(new { error }),
                "COMMENT_TOO_LONG" => BadRequest(new { error }),
                "NOT_FOUND" => NotFound(new { error }),
                "UNABLE_TO_COMMENT" => StatusCode(403, new { error }),
                "INVALID_CREDENTIALS" => BadRequest(new { error }),
                _ => StatusCode(500, new { error })
            };
        }

        return Ok(res);
    }
}