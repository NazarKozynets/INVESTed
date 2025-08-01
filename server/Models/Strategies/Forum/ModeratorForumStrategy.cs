namespace server.Models.Strategies.Forum;

public class ModeratorForumStrategy : ForumStrategy
{
    public override bool CanDeleteCommentFromForum(string commentCreatorId, string currentUserId)
    {
        return true;
    }
    
    public override bool CanCloseForum(bool isOwner)
    {
        return true;
    }
}