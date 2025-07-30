namespace server.Models.DTO.Cloudinary;

public class UploadImageRequestModel
{
    public IFormFile File { get; set; }
    public CloudinaryFolderToSave Folder { get; set; }
}