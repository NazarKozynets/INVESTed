import { toast } from "react-toastify";
import { AxiosError } from "axios";
import {AuthError, AuthErrorCode} from "../../types/auth.types.ts";

type ApiErrorResponse = {
    message?: string;
    error?: AuthErrorCode | string;
    details?: Record<string, unknown>;
};

export const handleApiError = (error: unknown): void => {
    if (isCheckAuthError(error) || isRefreshAuthError(error)) {
        return;
    }

    let errorMessage = "An unexpected error occurred. Please try again later.";

    if (error instanceof AxiosError) {
        const responseData = error.response?.data as ApiErrorResponse | undefined;
        const errorCode = responseData?.error;

        if (errorCode && errorCode in AuthError) {
            errorMessage = AuthError[errorCode as AuthErrorCode];
        }
        else if (responseData?.message) {
            errorMessage = responseData.message;
        } else {
            errorMessage = getHttpStatusMessage(error.response?.status);
        }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
};

const getHttpStatusMessage = (status?: number): string => {
    switch (status) {
        case 400: return "Bad request. Please check your input.";
        case 401: return "Unauthorized. Please login again.";
        case 403: return "Forbidden. You don't have permission for this action.";
        case 404: return "Resource not found.";
        case 409: return "Conflict detected. Please resolve the issue and try again.";
        case 422: return "Validation error. Please check your input.";
        case 429: return "Too many requests. Please wait and try again later.";
        case 500: return "Internal server error. Please try again later.";
        case 503: return "Service unavailable. Please try again later.";
        default: return "Network error occurred. Please check your connection.";
    }
};

const isCheckAuthError = (error: unknown): boolean => {
    return Boolean(
        error instanceof AxiosError &&
        error.config?.url?.endsWith("/auth/check") &&
        error.response?.status === 401
    );
}

const isRefreshAuthError = (error: unknown): boolean => {
    return Boolean(
        error instanceof AxiosError &&
        error.config?.url?.endsWith("/auth/refresh") &&
        error.response?.status === 415
    );
}