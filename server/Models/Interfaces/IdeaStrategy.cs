﻿using MongoDB.Bson.Serialization.Attributes;
using server.Enums;
using server.Models.DTO.Idea;
using server.Models.Idea;
using server.models.user;
using server.Services.Idea;

namespace server.Models.Interfaces;

public abstract class IdeaStrategy
{
    //created abstractt class instead of interface so I can make some methods optional 
    public virtual IdeaModel? StartIdea(StartIdeaModel ideaData, string creatorId)
    {
        return null;
    }

    public virtual IEnumerable<GetIdeaResponseModel> GetAllUserIdeas(IEnumerable<IdeaModel> ideas,
        bool? isOwner)
    {
        return ideas.Select(idea => new GetIdeaResponseModel(
            ideaId: idea.Id,
            idea.IdeaName,
            idea.IdeaDescription,
            idea.TargetAmount,
            idea.AlreadyCollected,
            idea.FundingDeadline,
            idea.Rating,
            idea.GetAverageRating(),
            canEdit: true
        ));
    }

    public virtual GetIdeaResponseModel GetFormattedIdea(IdeaModel idea, bool isOwner = false)
    {
        return new GetIdeaResponseModel(
            ideaId: idea.Id,
            idea.IdeaName,
            idea.IdeaDescription,
            idea.TargetAmount,
            idea.AlreadyCollected,
            idea.FundingDeadline,
            idea.Rating,
            idea.GetAverageRating(),
            comments: idea.Comments,
            creatorUsername: idea.CreatorUsername ?? null,
            canEdit: isOwner,
            isClosed: idea.Status == IdeaStatus.Closed
        );
    }
    
    public IEnumerable<GetIdeaResponseModel> GetFormattedIdeas(IEnumerable<IdeaModel> ideas)
    {
        return ideas.Select(idea => GetFormattedIdea(idea));
    }

    public virtual (IdeaRatingModel? newRate, RateIdeaResult resultMes) RateIdea(IdeaModel ideaToRate, int rate, string ratedBy, bool isOwner)
    {
        return (null, RateIdeaResult.NotEnoughAccess);
    }

    public virtual (IdeaCommentModel? newComment, CommentIdeaResult resultMes) AddCommentToIdea(IdeaModel ideaToAdd, string commentText, string commentatorId, string commentatorUsername)
    {
        return (null, CommentIdeaResult.NotEnoughAccess);
    }

    public virtual bool CanDeleteCommentFromIdea(string commentCreatorId, string currentUserId)
    {
        return commentCreatorId == currentUserId;
    }

    public virtual (decimal? updatedAlreadyCollected, IdeaFundingHistoryElementModel? fundingHistoryElementModel, InvestIdeaResult resultMes) InvestIdea(IdeaModel idea,
        string fundedById, string fundedByUsername, decimal fundingAmount, bool isOwner)
    {
        return (null, null, InvestIdeaResult.NotEnoughAccess);
    }
}