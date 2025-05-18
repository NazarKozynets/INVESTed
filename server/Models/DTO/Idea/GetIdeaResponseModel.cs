using server.Models.Idea;

namespace server.Models.DTO.Idea
{
    public class GetIdeaResponseModel
    {
        public string IdeaId { get; set; }
        public string IdeaName { get; set; }
        public string IdeaDescription { get; set; }
        public int TargetAmount { get; set; }
        public int AlreadyCollected { get; set; }
        public DateTime FundingDeadline { get; set; }
        public List<IdeaRatingModel> Rating { get; set; } 
        public double AverageRating { get; set; }
        public bool CanEdit { get; set; }
        public string CreatorUsername { get; set; }

        public GetIdeaResponseModel(string ideaId, string ideaName, string ideaDescription, int targetAmount, int alreadyCollected, DateTime fundingDeadline, List<IdeaRatingModel> rating, double averageRating,bool canEdit = false, string creatorUsername = null)
        {
            IdeaId = ideaId;
            IdeaName = ideaName;
            IdeaDescription = ideaDescription;
            TargetAmount = targetAmount;
            AlreadyCollected = alreadyCollected;
            FundingDeadline = fundingDeadline;
            Rating = rating;
            AverageRating = averageRating;
            CanEdit = canEdit;
            CreatorUsername = creatorUsername;
        }
    }
}