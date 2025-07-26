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
            forumTitle: forum.Title,
            forumDescription: forum.Description,
            comments: forum.Comments,
            creatorUsername: forum.CreatorUsername ?? null,
            createdAt: forum.CreatedAt,
            canEdit: isOwner,
            isClosed: forum.Status == ForumStatus.Closed
        );
    }
    
    public IEnumerable<GetForumResponseModel> GetFormattedForums(IEnumerable<ForumModel> forums)
    {
        return forums.Select(forum => GetFormattedForum(forum));
    }
}