import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { validateDeadline } from "../utils/functions/validations.ts";

interface StartIdeaStore {
    projectName: string;
    description: string;
    targetAmount: string;
    deadline: string;
    errors: {
        projectName: string;
        description: string;
        targetAmount: string;
        deadline: string;
    };
    setProjectName: (value: string) => void;
    setDescription: (value: string) => void;
    setTargetAmount: (value: string) => void;
    setDeadline: (value: string) => void;
    clear: () => void;
}

const validateIdeaName = (value: string): string => {
    if (!value.trim()) return "Idea name is required.";
    if (value.length > 50) return "Idea name must be 50 characters or less.";
    return "";
};

const validateDescription = (value: string): string => {
    if (!value.trim()) return "Description is required.";
    if (value.length < 50) return "Description must be 50 characters or less.";
    if (value.length > 500) return "Description must be 500 characters or less.";
    return "";
};

const validateTargetAmount = (value: string): string => {
    const numValue = parseFloat(value);
    if (!value.trim()) return "Target amount is required.";
    if (isNaN(numValue) || numValue <= 0) return "Target amount must be a positive number.";
    if (numValue > 1000000) return "Target amount must be less than or equal to 1,000,000.";
    return "";
};

export const useStartIdeaStore = create<StartIdeaStore>()(
    persist(
        (set) => ({
            projectName: "",
            description: "",
            targetAmount: "",
            deadline: "",
            errors: {
                projectName: "",
                description: "",
                targetAmount: "",
                deadline: "",
            },
            setProjectName: (value) =>
                set((state) => ({
                    projectName: value,
                    errors: {
                        ...state.errors,
                        projectName: validateIdeaName(value),
                    },
                })),
            setDescription: (value) =>
                set((state) => ({
                    description: value,
                    errors: {
                        ...state.errors,
                        description: validateDescription(value),
                    },
                })),
            setTargetAmount: (value) =>
                set((state) => ({
                    targetAmount: value,
                    errors: {
                        ...state.errors,
                        targetAmount: validateTargetAmount(value),
                    },
                })),
            setDeadline: (value) => {
                const numericValue = value.replace(/[^0-9]/g, "").slice(0, 8);
                return set((state) => ({
                    deadline: numericValue,
                    errors: {
                        ...state.errors,
                        deadline: validateDeadline(numericValue),
                    },
                }));
            },
            clear: () =>
                set(() => ({
                    projectName: "",
                    description: "",
                    targetAmount: "",
                    deadline: "",
                    errors: {
                        projectName: "",
                        description: "",
                        targetAmount: "",
                        deadline: "",
                    },
                })),
        }),
        {
            name: "start-idea-store",
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);