import {
    AuthRequestData,
    AuthResponseData,
    CheckAuthResponse,
    RefreshTokenResponse,
} from "../../types/auth.types.ts";
import {useRequest} from "../../utils/hooks/useRequest.ts";

export const checkAuth = async (): Promise<CheckAuthResponse> => {
    return await useRequest<CheckAuthResponse>('auth/check', "get");
};

export const loginUser = async (data: AuthRequestData): Promise<AuthResponseData> =>
    await useRequest<AuthResponseData>('auth/login', "post", data);

export const registerUser = async (data: AuthRequestData): Promise<AuthResponseData> =>
    await useRequest<AuthResponseData>('auth/register', "post", data);

export const refreshTokens = async (): Promise<RefreshTokenResponse> =>
    await useRequest<RefreshTokenResponse>('auth/refresh', "post");

export const logoutUser = async (): Promise<void> =>
    await useRequest('auth/logout', "post");
