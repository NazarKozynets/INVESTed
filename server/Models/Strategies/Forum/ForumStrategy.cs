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
}