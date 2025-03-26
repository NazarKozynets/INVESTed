import {AuthRequestData, AuthResponseData} from "../../types/auth.types.ts";
import {useRequest} from "../../utils/hooks/useRequest.ts";

export const registerUser = (data: AuthRequestData): Promise<AuthResponseData> => {
    return useRequest('auth/register', "post", data);
};

export const loginUser = (data: AuthRequestData): Promise<AuthResponseData> => {
  return useRequest('auth/login', "post", data);
};