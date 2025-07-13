export const ForumError = {
  FORUM_TITLE_TAKEN: "Forum with this title already exists",
  INVALID_TITLE: "Invalid title",
  INVALID_DESCRIPTION: "Invalid description",
  INVALID_CREATOR_ID: "Something went wrong on our side",

  EMPTY_COMMENT: "Comment cannot be empty!",
  COMMENT_TOO_LONG: "Looks like your comment is too long",
  UNABLE_TO_COMMENT: "You don't have access to comment this forum!",

  NOT_FOUND: "Forum not found.",
  UNKNOWN_ERROR: "Something went wrong on our side",
  SERVER_ERROR: "Something went wrong on our side",
} as const;

export type ForumErrorCode = keyof typeof ForumError;

export const getForumErrorMessage = (
  code?: string,
  fallback = "An unexpected error occurred. Please try again later.",
): string =>
  code && code in ForumError ? ForumError[code as ForumErrorCode] : fallback;

export interface CreateForumRequest {
  forumTitle: string;
  forumDescription: string;
  creatorId: string | null;
}
