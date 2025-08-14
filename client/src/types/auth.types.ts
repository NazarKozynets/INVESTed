export type UserRole = "Client" | "Moderator" | "Admin";
export const userRoleMap: Record<UserRole, number> = {
  Client: 0,
  Moderator: 1,
  Admin: 2,
};
export const userRoleMapReverse: Record<number, UserRole> = {
  0: "Client",
  1: "Moderator",
  2: "Admin",
};

export const AuthError = {
  EMAIL_EXISTS: "Email already registered",
  USERNAME_EXISTS: "Username already taken",

  EMAIL_NOT_FOUND: "Email not found",
  INVALID_PASSWORD: "Invalid password",
  INVALID_CREDENTIALS: "Invalid email or password",

  INVALID_OR_EXPIRED_TOKEN_RESET_PASSWORD:
    "Failed to reset password. The link may be expired.",

  ACCOUNT_LOCKED: "Account temporarily locked",
  EMAIL_NOT_VERIFIED: "Please verify your email first",
} as const;

export type AuthErrorCode = keyof typeof AuthError;

export const getAuthErrorMessage = (
  code?: string,
  fallback = "An unexpected error occurred. Please try again later.",
): string =>
  code && code in AuthError ? AuthError[code as AuthErrorCode] : fallback;

export interface UserData {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  isBanned: boolean;
  avatarUrl?: string | null;
  expiresIn?: string;
}

export interface AuthRequestData {
  email: string;
  password: string;
  role?: UserRole;
  username?: string;
}

export interface AuthResponseData {
  userData: {
    userId: string;
    username: string;
    email: string;
    role: UserRole;
    isBanned: boolean;
    expiresIn: string;
    avatarUrl?: string | null;
  };
}

export interface RefreshTokenResponse {
  expiresIn: string;
}

export interface CheckAuthResponse {
  userData: UserData | null;
}

export interface AuthFormProps {
  emailInput: string;
  setEmailInput: (input: string) => void;
  setIsSignup: (input: boolean) => void;
}

export interface ResetPasswordRequest {}
