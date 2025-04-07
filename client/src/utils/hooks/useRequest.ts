import axios from "axios";
import {handleApiError} from "../../services/api/error.api.ts";
import {logoutUser, refreshTokens} from "../../services/auth/auth.api.ts";

export type HttpMethods = "get" | "post" | "put" | "delete" | "patch";

export const useRequest = async <T = any>(
    requestUrl: string,
    httpMethod: HttpMethods,
    requestData?: unknown
): Promise<T> => {
    try {
        const response = await axios({
            method: httpMethod,
            url: `${import.meta.env.VITE_API_URL}/${requestUrl}`,
            data: requestData,
            withCredentials: true,
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data as T;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            try {
                console.log('client tried to refresh token');
                await refreshTokens();
                return useRequest<T>(requestUrl, httpMethod, requestData);
            } catch (refreshError) {
                if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
                    await logoutUser();
                }
                throw error;
            }
        }

        handleApiError(error);

        throw error;
    }
};