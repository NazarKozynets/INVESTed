export type UserRole = "client" | "moderator" | "admin";

export const AuthError = {
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_EXISTS: "Email already registered",
    USERNAME_EXISTS: "Username already taken",
    ACCOUNT_LOCKED: "Account temporarily locked",
    EMAIL_NOT_VERIFIED: "Please verify your email first",
} as const;

export type AuthErrorCode = keyof typeof AuthError;

export interface UserData {
    userId: string;
    userName: string;
    email: string;
    role: UserRole;
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
        userName: string;
        email: string;
        role: UserRole;
        expiresIn: string;
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