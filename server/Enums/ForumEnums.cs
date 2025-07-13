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