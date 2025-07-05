namespace server.Enums;

public enum RateIdeaResult
{
    Success,
    AlreadyRated,
    RateYourIdea,
    EmptyRatedBy,
    InvalidRating,
    NotEnoughAccess,
}

public enum CommentIdeaResult
{
    Success,             
    EmptyComment,        
    EmptyCommentedBy,
    NotEnoughAccess,     
    CommentTooLong,      
}

public enum InvestIdeaResult
{
    Success,
    InvestYourIdea,
    EmptyFundedBy,
    InvalidFundingAmount,
    NotEnoughAccess,
    FundingAmountGreaterThanTarget,
}