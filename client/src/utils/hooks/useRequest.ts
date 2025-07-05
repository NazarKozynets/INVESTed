import axios from "axios";
import { AuthErrorCode } from "../../types/auth.types.ts";
import { logoutUser, refreshTokens } from "../../services/auth/auth.api.ts";
import { handleApiError } from "../../services/api/error.api.ts";

export type HttpMethods = "get" | "post" | "put" | "delete" | "patch";

const shouldTryRefresh = (err: unknown): boolean => {
  if (!axios.isAxiosError(err) || err.response?.status !== 401) return false;

  const code = (err.response?.data as { error?: string })?.error as
    | AuthErrorCode
    | undefined;

  return !(code === "EMAIL_NOT_FOUND" || code === "INVALID_PASSWORD");
};

export const useRequest = async <T = unknown>(
  requestUrl: string,
  httpMethod: HttpMethods,
  requestData?: unknown,
  refreshAttempt: number = 0,
): Promise<T> => {
  try {
    const { data } = await axios({
      method: httpMethod,
      url: `${import.meta.env.VITE_API_URL}/${requestUrl}`,
      data: requestData ?? {},
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    });
    return data as T;
  } catch (error) {
    if (shouldTryRefresh(error) && refreshAttempt < 2) {
      try {
        await refreshTokens();
        return useRequest<T>(
          requestUrl,
          httpMethod,
          requestData,
          refreshAttempt + 1,
        );
      } catch (refreshErr) {
        await logoutUser();
      }
    }

    handleApiError(error);
    throw error;
  }
};
