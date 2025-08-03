import { IdeaCommentModel } from "./idea.types.ts";

export const ForumError = {
  FORUM_TITLE_TAKEN: "Forum with this title already exists",
  INVALID_TITLE: "Invalid title",
  INVALID_DESCRIPTION: "Invalid description",
  INVALID_CREATOR_ID: "Something went wrong on our side",

  EMPTY_COMMENT: "Comment cannot be empty!",
  COMMENT_TOO_LONG: "Looks like your comment is too long",
  UNABLE_TO_COMMENT: "You don't have access to comment this forum!",

  DELETE_FAILED: "Failed to delete comment",
  FAILED_CHANGING_HELPFUL_STATUS: "Can't change comment status now!",

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
  forumImageUrl: string | null;
  creatorId: string | null;
}

export interface ForumSearchResult {
  id: string;
  forumTitle: string;
  creatorId: string;
  creatorUsername: string;
  isClosed: boolean;
  creatorAvatarUrl?: string | null;
}

export const sortForumsOptions = [
  "Newest", // CreatedAt desc
  "Latest", // CreatedAt asc
  "Closed", // Status: Closed asc
] as const;

export type SortForumOption = (typeof sortForumsOptions)[number];

export type SortForumByField = "CreatedAt" | "Status";
export type SortForumOrder = "asc" | "desc";

export const sortMappings: Record<
  SortForumOption,
  { sortBy: SortForumByField; sortOrder: SortForumOrder }
> = {
  Newest: { sortBy: "CreatedAt", sortOrder: "desc" },
  Latest: { sortBy: "CreatedAt", sortOrder: "asc" },
  Closed: { sortBy: "Status", sortOrder: "asc" },
};

export interface ForumCommentModel extends IdeaCommentModel {
  isHelpful: boolean;
}

export interface ForumType {
  forumId: string;
  forumTitle: string;
  imageUrl?: string | null;
  forumDescription: string;
  createdAt: string;
  isClosed: boolean;
  comments: ForumCommentModel[];
  creatorUsername?: string | null;
  creatorAvatarUrl?: string | null;
  canEdit?: boolean;
}

export interface GetLimitedAmountOfSortedForumsResponse {
  forums: Array<ForumType>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddCommentRequest {
  forumId: string;
  commentText: string;
}
