export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
    return password.length >= 8 &&
        /[A-Za-z]/.test(password) &&
        /\d/.test(password);
};

export const validateDeadline = (value: string): string => {
    const dateRegex = /^\d{8}$/;
    if (!dateRegex.test(value)) {
        return "Please enter the date as 8 digits in DDMMYYYY format (e.g., 31122025).";
    }

    const day = parseInt(value.substring(0, 2));
    const month = parseInt(value.substring(2, 4));
    const year = parseInt(value.substring(4, 8));

    const inputDate = new Date(year, month - 1, day);
    const currentDate = new Date(2025, 3, 27);

    if (
        isNaN(inputDate.getTime()) ||
        inputDate.getDate() !== day ||
        inputDate.getMonth() + 1 !== month ||
        inputDate.getFullYear() !== year
    ) {
        return "Invalid date. Please enter a valid date.";
    }

    if (inputDate <= currentDate) {
        return "The deadline must be a future date (after April 27, 2025).";
    }

    return "";
};