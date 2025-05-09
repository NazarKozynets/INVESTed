const ProfileError = {
    USER_NOT_FOUND:  "User not found",
    UNAUTHORIZED:    "You cannot edit this profile",
    EXISTING_EMAIL:  "Email already in use",
    EXISTING_USERNAME: "Username already taken",
} as const;

type ProfileErrorCode = keyof typeof ProfileError;

export const getProfileErrorMessage = (
    code?: string,
    fallback = "Profile error"
): string =>
    code && code in ProfileError
        ? ProfileError[code as ProfileErrorCode]
        : fallback;

export interface GetProfileResponseData {
    username: string;
    email: string;
    canEdit: boolean;
}

export interface UpdateProfileFieldsRequestData {
    id: string;
    username?: string;
    email?: string;
}