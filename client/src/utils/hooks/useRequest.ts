import axios from "axios";
import {handleApiError} from "../../services/api/error.api.ts";

export type HttpMethods = "get" | "post" | "put" | "delete" | "patch";

export const useRequest = async (
    requestUrl: string,
    httpMethod: HttpMethods,
    requestData?: any
) => {
    if (!requestUrl) return;

    try {
        const response = await axios({
            method: httpMethod,
            url: `${import.meta.env.VITE_API_URL}/${requestUrl}`,
            data: requestData,
        });
        return response.data;
    } catch (error) {
        console.error('Error making request', error);
        handleApiError(error);
        return;
    }
};
