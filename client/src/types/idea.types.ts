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

export interface Idea {
    ideaName: string;
    ideaDescription: string;
    targetAmount: number;
    fundingDeadline: Date;
    canEdit?: boolean | false;
}

export interface GetAllClientIdeasResponse {
    ideas: Array<Idea>;
}