using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models.DTO.Forum;
using server.Services.Forum;

namespace server.Controllers.Forum;

[Route("api/forum")]
[Authorize]
[ApiController]
public class ForumController : ControllerBase
{
    private readonly ForumService _forumService;

    public ForumController(ForumService forumService)
    {
        _forumService = forumService;
    }
    
    [HttpPost("create")]
    public async Task<ActionResult<object>> CreateForum(CreateForumModel data)
    {
        var (createdForumId, error) = await _forumService.CreateForumAsync(data, User);

        if (error != null)
        {
            return error switch
            {
                "FORUM_NAME_TAKEN" => Conflict(new { error }),                 
                "INVALID_TITLE" => BadRequest(new { error }),               
                "INVALID_CREATOR_ID" => BadRequest(new { error }),          
                "INVALID_DESCRIPTION" => BadRequest(new { error }),          
                _ => StatusCode(500, new { error })                          
            };
        }

        if (string.IsNullOrWhiteSpace(createdForumId))
        {
            return StatusCode(500, new { error = "SERVER_ERROR" });
        }

        return Created("forum/create", new { id = createdForumId });
    }
    
    [HttpGet("search")]
    public async Task<ActionResult<object>> SearchForums(
        [FromQuery] string query,
        [FromQuery] int limit = 10)
    {
        var (forums, total, error) =
            await _forumService.SearchForumsAsync(query, limit, User);

        if (error != null)
        {
            return error switch
            {
                "INVALID_PARAMETERS" => BadRequest(new { error }),
                "INVALID_QUERY" => BadRequest(new { error }),
                "SERVER_ERROR" => StatusCode(500, new { error }),
                _ => StatusCode(500, new { error })
            };
        }

        return Ok(new
        {
            forums,
            total,
            limit
        });
    }
    
    [HttpGet("get/all/{userId}")]
    public async Task<ActionResult<object>> GetAllUserForums(string userId)
    {
        var (forums, error) = await _forumService.GetAllUserForumsAsync(userId, User);

        if (error != null)
        {
            return error switch
            {
                "SERVER_ERROR" => StatusCode(500, new { error }),
                _ => StatusCode(500, new { error }),
            };
        }

        return Ok(forums);
    }
    
    [HttpGet("get/{forumId}")]
    public async Task<ActionResult<object>> GetForumById(string forumId)
    {
        var (forum, error) = await _forumService.GetForumByIdAsync(forumId, User);

        if (error != null)
        {
            return error switch
            {
                "INVALID_ID" => BadRequest(new { error }),
                "NOT_FOUND" => NotFound(new { error }),
                _ => StatusCode(500, new { error })
            };
        }

        return Ok(forum);
    }

    [HttpGet("get/sorted")]
    public async Task<ActionResult<object>> GetLimitedAmountOfSortedForums(
        [FromQuery] int page = 1,
        [FromQuery] int limit = 10,
        [FromQuery] string sortBy = "CreatedAt",
        [FromQuery] string sortOrder = "desc")
    {
        var (forums, total, error) =
            await _forumService.GetLimitedAmountOfSortedForumsAsync(page, limit, sortBy, sortOrder, User);

        if (error != null)
        {
            return error switch
            {
                "INVALID_PARAMETERS" => BadRequest(new { error }),
                _ => StatusCode(500, new { error }),
            };
        }

        return Ok(new
        {
            forums,
            total,
            page,
            limit,
            totalPages = (int)Math.Ceiling((double)total / limit)
        });
    }
    
    [HttpPost("add-comment")]
    public async Task<ActionResult<object>> AddCommentToForum(AddCommentToForumModel data)
    {
        var (res, error) = await _forumService.AddCommentToForumAsync(data, User);

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
    
    [HttpDelete("delete-comment")]
    public async Task<ActionResult<object>> DeleteCommentFromForum(string commentId)
    {
        var (res, error) = await _forumService.DeleteCommentFromForumAsync(commentId, User);

        if (res == null && error != null)
        {
            return error switch
            {
                "INVALID_ID" => BadRequest(new { error }),
                "NOT_FOUND" => NotFound(new { error }),
                "INVALID_CREDENTIALS" => BadRequest(new { error }),
                "NOT_ENOUGH_ACCESS" => Forbid(),
                "DELETE_FAILED" => StatusCode(409, new { error }),
                "COMMENT_NOT_FOUND" => NotFound(new { error }),
                _ => StatusCode(500, new { error })
            };
        }

        return Ok(res);
    }

    [HttpPatch("close/{forumId}")]
    public async Task<ActionResult<object>> CloseForum(string forumId)
    {
        string? error = await _forumService.CloseForumAsync(forumId, User);

        if (error != null)
        {
            return error switch
            {
                "INVALID_ID" => BadRequest(new { error }),
                "NOT_FOUND" => NotFound(new { error }),
                "INVALID_CREDENTIALS" => BadRequest(new { error }),
                "NOT_ENOUGH_ACCESS" => Forbid(),
                _ => StatusCode(500, new { error })
            };
        }
        
        return  Ok(forumId);
    }
}