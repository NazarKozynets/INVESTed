using server.Enums;
using server.Models.DTO.Forum;
using server.Models.Forum;

namespace server.Models.Strategies.Forum;

public class ClientForumStrategy : ForumStrategy
{
    public override (ForumModel? createdForum, CreateForumResult resMessage) CreateForum(CreateForumModel forumData,
        string creatorId)
    {
        try
        {
            return (new ForumModel(creatorId, forumData.ForumTitle, forumData.ForumDescription, imageUrl:  forumData.ForumImageUrl),
                CreateForumResult.Success);
        }
        catch (Exception e)
        {
            switch (e.Message)
            {
                case "INVALID_CREATOR_ID": return (null, CreateForumResult.InvalidCreatorId);
                case "INVALID_TITLE": return (null, CreateForumResult.InvalidTitle);
                case "INVALID_DESCRIPTION": return (null, CreateForumResult.InvalidDescription);
                default: return (null, CreateForumResult.UnknownError);
            }
        }
    }
    
    public override IEnumerable<GetForumResponseModel> GetAllUserForums(IEnumerable<ForumModel> forums,
        bool? isOwner)
    {
        return forums.Select(forum => new GetForumResponseModel(
            forumId: forum.Id,
            creatorId: forum.CreatorId,
            forumTitle: forum.Title,
            forumDescription: forum.Description,
            comments: forum.Comments,
            createdAt: forum.CreatedAt,
            isClosed: forum.Status == ForumStatus.Closed,
            imageUrl: forum.ImageUrl ?? null,
            canEdit: isOwner ?? false
        ));
    }
    
    public override GetForumResponseModel GetFormattedForum(ForumModel forum, bool isOwner = false)
    {
        return new GetForumResponseModel(
            forumId: forum.Id,
            creatorId: forum.CreatorId,
            forumTitle: forum.Title,
            forumDescription: forum.Description,
            comments: forum.Comments,
            creatorUsername: forum.CreatorUsername ?? null,
            creatorAvatarUrl: forum.CreatorAvatarUrl,
            createdAt: forum.CreatedAt,
            canEdit: isOwner,
            imageUrl: forum.ImageUrl ?? null,
            isClosed: forum.Status == ForumStatus.Closed
        );
    }
    
    public override bool CanDeleteCommentFromForum(string commentCreatorId, string currentUserId)
    {
        return commentCreatorId == currentUserId;
    }
    
    public override bool CanCloseForum(bool isOwner)
    {
        return isOwner; 
    }
    
    public override bool CanChangeCommentHelpfulStatus(bool isOwner)
    {
        return isOwner;
    }
}