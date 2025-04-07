import {
    AuthRequestData,
    AuthResponseData,
    CheckAuthResponse,
    RefreshTokenResponse,
} from "../../types/auth.types.ts";
import {useRequest} from "../../utils/hooks/useRequest.ts";

export const checkAuth = (): Promise<CheckAuthResponse> => {
    return useRequest<CheckAuthResponse>('auth/check', "get");
};

export const loginUser = (data: AuthRequestData): Promise<AuthResponseData> =>
    useRequest<AuthResponseData>('auth/login', "post", data);

export const registerUser = (data: AuthRequestData): Promise<AuthResponseData> =>
    useRequest<AuthResponseData>('auth/register', "post", data);

export const refreshTokens = (): Promise<RefreshTokenResponse> => {
    return useRequest<RefreshTokenResponse>('auth/refresh', "post");
};

export const logoutUser = (): Promise<void> => {
    return useRequest('auth/logout', "post");
};