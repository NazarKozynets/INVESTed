export const IdeaError = {
    IDEA_NAME_TAKEN: "Idea name already exists",
} as const;

export type IdeaErrorCode = keyof typeof IdeaError;

export const getIdeaErrorMessage = (
    code?: string,
    fallback = "An unexpected error occurred. Please try again later."
): string =>
    code && code in IdeaError ? IdeaError[code as IdeaErrorCode] : fallback;

export interface StartIdeaRequest {
    ideaName: string,
    ideaDescription: string,
    targetAmount: number,
    fundingDeadline: Date,
    creatorId: string | null,
}

export interface IdeaType {
    ideaId: string;
    ideaName: string;
    ideaDescription: string;
    targetAmount: number;
    alreadyCollected: number;
    fundingDeadline: Date;
    canEdit?: boolean | false;
    creatorUsername?: string | null;
}

export interface GetLimitedAmountOfSortedIdeasResponse {
    ideas: Array<IdeaType>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const sortIdeasOptions = [
    "Best Rated",         // Rating desc
    "Newest",             // CreatedAt desc
    "Lowest Target",      // TargetAmount asc
    "Most Funded",        // AlreadyCollected desc
    "Ending Soon",        // FundingDeadline asc
] as const;

export type SortIdeaOption = typeof sortIdeasOptions[number];

export type SortIdeaByField = 'Rating' | 'CreatedAt' | 'TargetAmount' | 'AlreadyCollected' | 'FundingDeadline';
export type SortIdeaOrder = 'asc' | 'desc';

export const sortMappings: Record<SortIdeaOption, { sortBy: SortIdeaByField; sortOrder: SortIdeaOrder }> = { //backend sort mapping
    "Best Rated": { sortBy: "Rating", sortOrder: "desc" },
    "Newest": { sortBy: "CreatedAt", sortOrder: "desc" },
    "Lowest Target": { sortBy: "TargetAmount", sortOrder: "asc" },
    "Most Funded": { sortBy: "AlreadyCollected", sortOrder: "desc" },
    "Ending Soon": { sortBy: "FundingDeadline", sortOrder: "asc" },
};