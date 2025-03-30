export type UserRole = "client" | "moderator" | "admin";

export interface AuthRequestData {
    email: string;
    password: string;
    userRole?: UserRole;
    username?: string;
}

export interface AuthResponseData {
    userData: {
        email: string;
        userRole: string;
        username: string;
    };
    token: string;
}

export interface AuthFormProps {
    emailInput: string;
    setEmailInput: (input: string) => void;
    setIsSignup: (input: boolean) => void;
}