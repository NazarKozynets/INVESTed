import {toast} from "react-toastify";
import {AxiosError} from "axios";

export const handleApiError = (error: any) => {
    let message = 'An error occurred. Please try again later.';

    if (error instanceof AxiosError) {
        if (error.response) {
            const statusCode = error.response.status;
            if (statusCode === 401) {
                message = 'You are not authorized to access this resource.';
            } else if (statusCode === 500) {
                message = 'Something went wrong on the server.';
            } else {
                message = error.response.data?.message || 'An unknown error occurred.';
            }
        } else if (error.request) {
            message = 'Failed to connect to the server. Please check your internet connection.';
        } else {
            message = error.message || 'An unknown error occurred.';
        }
    } else {
        message = 'An unknown error occurred.';
    }

    toast.error(message)
}