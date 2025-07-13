import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CreateForumStore {
  forumTitle: string;
  forumDescription: string;
  errors: {
    forumTitle: string;
    forumDescription: string;
  };
  setForumTitle: (value: string) => void;
  setForumDescription: (value: string) => void;
  clear: () => void;
}

const validateForumTitle = (value: string): string => {
  if (!value.trim()) return "Forum title is required.";
  if (value.length > 150) return "Forum title must be 150 characters or less.";
  return "";
};

const validateForumDescription = (value: string): string => {
  if (!value.trim()) return "Description is required.";
  if (value.length < 50) return "Description must be 50 characters or less.";
  if (value.length > 2000)
    return "Description must be 2000 characters or less.";
  return "";
};

export const useCreateForumStore = create<CreateForumStore>()(
  persist(
    (set) => ({
      forumTitle: "",
      forumDescription: "",
      errors: {
        forumTitle: "",
        forumDescription: "",
      },
      setForumTitle: (value) =>
        set((state) => ({
          forumTitle: value,
          errors: {
            ...state.errors,
            forumTitle: validateForumTitle(value),
          },
        })),
      setForumDescription: (value) =>
        set((state) => ({
          forumDescription: value,
          errors: {
            ...state.errors,
            forumDescription: validateForumDescription(value),
          },
        })),
      clear: () =>
        set(() => ({
          forumTitle: "",
          forumDescription: "",
          errors: {
            forumTitle: "",
            forumDescription: "",
          },
        })),
    }),
    {
      name: "create-forum-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
