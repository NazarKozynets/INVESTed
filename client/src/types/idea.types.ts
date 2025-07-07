export const IdeaError = {
  IDEA_NAME_TAKEN: "Idea name already exists",

  ALREADY_RATED: "You have already rated this idea!",
  INVALID_RATING: "Invalid rate for this idea",
  RATE_YOUR_IDEA: "You can't rate your idea",
  UNABLE_TO_RATE: "You don't have access to rate this idea!",

  EMPTY_COMMENT: "Comment cannot be empty!",
  COMMENT_TOO_LONG: "Looks like your comment is too long",
  UNABLE_TO_COMMENT: "You don't have access to comment this idea!",

  INVALID_FUNDING_AMOUNT: "Looks like your funding amount number isn't normal!",
  INVEST_YOUR_IDEA: "You can't invest your idea",
  UNABLE_TO_INVEST: "You don't have access to invest this idea!",
  FUNDING_AMOUNT_GREATER_THAN_TARGET:
    "Your funding amount is greater than Idea's target amount",

  NOT_FOUND: "Idea not found.",
} as const;

export type IdeaErrorCode = keyof typeof IdeaError;

export const getIdeaErrorMessage = (
  code?: string,
  fallback = "An unexpected error occurred. Please try again later.",
): string =>
  code && code in IdeaError ? IdeaError[code as IdeaErrorCode] : fallback;

export interface StartIdeaRequest {
  ideaName: string;
  ideaDescription: string;
  targetAmount: number;
  fundingDeadline: Date;
  creatorId: string | null;
}

export interface IdeaRatingType {
  ratedBy: string;
  rating: number;
}

export interface IdeaCommentModel {
  id: string;
  commentText: string;
  commentatorId: string;
  commentatorUsername: string;
  commentDate: string;
}

export interface IdeaType {
  ideaId: string;
  ideaName: string;
  ideaDescription: string;
  targetAmount: number;
  alreadyCollected: number;
  fundingDeadline: Date;
  rating: IdeaRatingType[];
  comments: IdeaCommentModel[];
  averageRating: number;
  canEdit: boolean;
  creatorUsername?: string | null;
  isClosed: boolean;
}

export interface GetLimitedAmountOfSortedIdeasResponse {
  ideas: Array<IdeaType>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const sortIdeasOptions = [
  "Best Rated", // Rating desc
  "Newest", // CreatedAt desc
  "Lowest Target", // TargetAmount asc
  "Most Funded", // AlreadyCollected desc
  "Ending Soon", // FundingDeadline asc
] as const;

export type SortIdeaOption = (typeof sortIdeasOptions)[number];

export type SortIdeaByField =
  | "Rating"
  | "CreatedAt"
  | "TargetAmount"
  | "AlreadyCollected"
  | "FundingDeadline";
export type SortIdeaOrder = "asc" | "desc";

export const sortMappings: Record<
  SortIdeaOption,
  { sortBy: SortIdeaByField; sortOrder: SortIdeaOrder }
> = {
  //backend sort mapping
  "Best Rated": { sortBy: "Rating", sortOrder: "desc" },
  Newest: { sortBy: "CreatedAt", sortOrder: "desc" },
  "Lowest Target": { sortBy: "TargetAmount", sortOrder: "asc" },
  "Most Funded": { sortBy: "AlreadyCollected", sortOrder: "desc" },
  "Ending Soon": { sortBy: "FundingDeadline", sortOrder: "asc" },
};

export interface RateIdeaRequest {
  ideaId: string;
  rate: number;
}

export interface AddCommentRequest {
  ideaId: string;
  commentText: string;
}

export interface InvestIdeaRequest {
  ideaId: string;
  fundingAmount: number;
}
