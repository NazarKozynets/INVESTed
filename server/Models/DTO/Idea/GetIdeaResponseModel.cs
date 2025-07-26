using server.Models.Idea;

namespace server.Models.DTO.Idea
{
    public class GetIdeaResponseModel
    {
        public string IdeaId { get; set; }
        public string IdeaName { get; set; }
        public string IdeaDescription { get; set; }
        public decimal TargetAmount { get; set; }
        public decimal AlreadyCollected { get; set; }
        public DateTime FundingDeadline { get; set; }
        public List<IdeaRatingModel> Rating { get; set; }
        public double AverageRating { get; set; }
        public string? CreatorUsername { get; set; }
        public bool CanEdit { get; set; }
        public List<IdeaCommentModel>? Comments { get; set; }
        public bool IsClosed { get; set; }

        public GetIdeaResponseModel(
            string ideaId,
            string ideaName,
            string ideaDescription,
            decimal targetAmount,
            decimal alreadyCollected,
            DateTime fundingDeadline,
            List<IdeaRatingModel> rating,
            double averageRating,
            List<IdeaCommentModel>? comments = null,
            bool canEdit = false,
            string? creatorUsername = null,
            bool isClosed = false)
        {
            IdeaId = ideaId;
            IdeaName = ideaName;
            IdeaDescription = ideaDescription;
            TargetAmount = targetAmount;
            AlreadyCollected = alreadyCollected;
            FundingDeadline = fundingDeadline;
            Rating = rating;
            AverageRating = averageRating;
            Comments = comments ?? new List<IdeaCommentModel>(); 
            CanEdit = canEdit;
            CreatorUsername = creatorUsername;
            IsClosed = isClosed;
        }
    }
}