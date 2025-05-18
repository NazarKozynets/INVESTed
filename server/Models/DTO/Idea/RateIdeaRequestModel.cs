namespace server.Models.DTO.Idea;

public class RateIdeaRequestModel
{
    public string RatedBy { get; set; }
    public int Rate { get; set; }
    public string IdeaId { get; set; }
}