namespace server.Enums;

public enum CreateForumResult
{
    Success,
    NotEnoughAccess,
    InvalidTitle,
    InvalidDescription,
    InvalidCreatorId,
    UnknownError,
}

public enum CommentForumResult
{
    Success,             
    EmptyComment,        
    EmptyCommentedBy,
    CommentTooLong,      
    NotEnoughAccess,     
}