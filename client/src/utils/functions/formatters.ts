export const formatDeadline = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, "");

    if (numericValue.length <= 2) {
        return numericValue;
    } else if (numericValue.length <= 4) {
        return `${numericValue.substring(0, 2)}-${numericValue.substring(2)}`;
    } else {
        return `${numericValue.substring(0, 2)}-${numericValue.substring(2, 4)}-${numericValue.substring(4)}`;
    }
};