const ProfileError = {
  USER_NOT_FOUND: "User not found",
  UNAUTHORIZED: "You cannot edit this profile",
  EXISTING_EMAIL: "Email already in use",
  EXISTING_USERNAME: "Username already taken",
  UPDATE_BANNED_ACCOUNT: "You cannot edit banned account",
  INVALID_ROLE: "Looks like role you selected does not exist",
  UPDATE_FAILED: "Update failed",
  NOT_ENOUGH_ACCESS: "You cannot edit this profile",
  ADMIN_ADMIN: "You can't ban administrator",
} as const;

type ProfileErrorCode = keyof typeof ProfileError;

export const getProfileErrorMessage = (
  code?: string,
  fallback = "Profile error",
): string =>
  code && code in ProfileError
    ? ProfileError[code as ProfileErrorCode]
    : fallback;

export interface GetProfileResponseData {
  userId: string;
  userRole: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  averageIdeaRating: number | null;
  totalIdeasAmount: number | null;
  totalFunding: number | null;
  totalForumsAmount: number | null;
  totalClosedForumsAmount: number | null;
  helpfulAnswersAmount: number | null;
  isBanned: boolean;
  canEdit: boolean;
}

export interface UpdateProfileFieldsRequestData {
  id: string;
  username?: string;
  email?: string;
  password?: string;
  avatarUrl?: string;
}

export interface UpdateUserRoleRequestData {
  id: string;
  newRole: number;
}