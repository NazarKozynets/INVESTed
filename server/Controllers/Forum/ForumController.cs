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
                "UNKNOWN_ERROR" => StatusCode(500, new { error }),          
                "SERVER_ERROR" => StatusCode(500, new { error }),            
                _ => StatusCode(500, new { error })                          
            };
        }

        if (string.IsNullOrWhiteSpace(createdForumId))
        {
            return StatusCode(500, new { error = "SERVER_ERROR" });
        }

        return Created("forum/create", new { id = createdForumId });
    }
}