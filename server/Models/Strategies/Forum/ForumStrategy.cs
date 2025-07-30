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
            canEdit: isOwner,
            imageUrl: forum.ImageUrl ?? null,
            isClosed: forum.Status == ForumStatus.Closed
        );
    }
    
    public IEnumerable<GetForumResponseModel> GetFormattedForums(IEnumerable<ForumModel> forums)
    {
        return forums.Select(forum => GetFormattedForum(forum));
    }

    public virtual (ForumCommentModel? newComment, CommentForumResult resultMes) AddCommentToForum(
        ForumModel forumToAdd, string commentText, string commentatorId, string commentatorUsername)
    {
        return (null, CommentForumResult.NotEnoughAccess);
    }
    
    public virtual bool CanDeleteCommentFromForum(string commentCreatorId, string currentUserId)
    {
        return commentCreatorId == currentUserId;
    }
}