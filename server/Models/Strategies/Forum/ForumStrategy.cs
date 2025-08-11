using server.Enums;
using server.Models.DTO.Forum;
using server.Models.Forum;

namespace server.Models.Strategies.Forum;

public abstract class ForumStrategy
{
    public virtual (ForumModel? createdForum, CreateForumResult resMessage) CreateForum(CreateForumModel forumData, string creatorId)
    {
        return (null, CreateForumResult.NotEnoughAccess);
    }
    
    public virtual IEnumerable<GetForumResponseModel> GetAllUserForums(IEnumerable<ForumModel> forums,
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
            isOwnerBanned: forum.IsOwnerBanned ?? false,
            canEdit: true
        ));
    }
    
    //for clients let it be canEdit: isOwner but moders and admins can edit 
    public virtual GetForumResponseModel GetFormattedForum(ForumModel forum, bool isOwner = false)
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
            canEdit: true,
            imageUrl: forum.ImageUrl ?? null,
            isOwnerBanned: forum.IsOwnerBanned ?? false,
            isClosed: forum.Status == ForumStatus.Closed
        );
    }
    
    public IEnumerable<GetForumResponseModel> GetFormattedForums(IEnumerable<ForumModel> forums)
    {
        return forums.Select(forum => GetFormattedForum(forum));
    }

    public virtual (ForumCommentModel? newComment, CommentForumResult resultMes) AddCommentToForum(
        ForumModel forumToAdd, string commentText, string commentatorId)
    {
        if (string.IsNullOrWhiteSpace(commentText))
            return (null, CommentForumResult.EmptyComment);
        if (string.IsNullOrWhiteSpace(commentatorId))
            return (null, CommentForumResult.EmptyCommentedBy);
        if (commentText.Length > 2000)
            return (null, CommentForumResult.CommentTooLong);
        
        var newComment = forumToAdd.AddComment(commentText, commentatorId);
        return (newComment, CommentForumResult.Success);
    }
    
    public virtual bool CanDeleteCommentFromForum(string commentCreatorId, string currentUserId)
    {
        return true;
    }

    public virtual bool CanCloseForum(bool isOwner)
    {
        return true; 
    }

    public virtual bool CanChangeCommentHelpfulStatus(bool isOwner)
    {
        return true;
    }
}