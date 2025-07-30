using System.Text.RegularExpressions;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using server.Models.DTO.Cloudinary;

public enum CloudinaryFolderToSave
{
    Forums,
    Avatars,
    Comments
}

public class CloudinaryService
{
    private readonly Cloudinary _cloudinary;
    private readonly ILogger<CloudinaryService> _logger;

    public CloudinaryService(IConfiguration configuration, ILogger<CloudinaryService> logger)
    {
        _logger = logger;
        
        var account = new Account(
            configuration["Cloudinary:CloudName"],
            configuration["Cloudinary:ApiKey"],
            configuration["Cloudinary:ApiSecret"]
        );

        _cloudinary = new Cloudinary(account);
    }

    public async Task<string?> UploadImageAsync(IFormFile file, CloudinaryFolderToSave folder)
    {
        if (file == null || file.Length == 0)
        {
            _logger.LogWarning("Файл пустой.");
            return null;
        }

        await using var stream = file.OpenReadStream();
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Folder = folder.ToString(),
            UseFilename = true,
            UniqueFilename = true,
            Overwrite = false,
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.StatusCode == System.Net.HttpStatusCode.OK)
            return uploadResult.SecureUrl?.ToString();

        _logger.LogError("Cloudinary upload error: {0}", uploadResult.Error?.Message);
        return null;
    }
}