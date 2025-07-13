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
            return (new ForumModel(creatorId, forumData.ForumTitle, forumData.ForumDescription),
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
}