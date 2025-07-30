using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using server.Models.DTO.Cloudinary;

namespace server.Controllers.Cloudinary;

[Route("api/cloudinary")]
[Authorize]
[ApiController]
public class CloudinaryController : ControllerBase
{
    private readonly CloudinaryService _cloudinaryService;
    private readonly ILogger<CloudinaryController> _logger;

    public CloudinaryController(CloudinaryService cloudinaryService, ILogger<CloudinaryController> logger)
    {
        _cloudinaryService = cloudinaryService;
        _logger = logger;
    }
    
    [HttpPost("upload/image")]
    public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromForm] CloudinaryFolderToSave folder)
    {
        var imageUrl = await _cloudinaryService.UploadImageAsync(file, folder);

        if (imageUrl == null)
            return BadRequest(new { message = "Image upload failed" });

        return Ok(new { url = imageUrl });
    }
}