import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CreateForumStore {
  forumTitle: string;
  forumDescription: string;
  selectedImage: string | null;
  errors: {
    forumTitle: string;
    forumDescription: string;
  };
  setForumTitle: (value: string) => void;
  setForumDescription: (value: string) => void;
  setSelectedImage: (value: string | null) => void;
  clear: () => void;
}

const validateForumTitle = (value: string): string => {
  if (!value.trim()) return "Forum title is required.";
  if (value.length > 300) return "Forum title must be 300 characters or less.";
  return "";
};

const validateForumDescription = (value: string): string => {
  if (!value.trim()) return "Description is required.";
  if (value.length < 50) return "Description must be 50 characters or more.";
  if (value.length > 3000) return "Description is too long.";
  return "";
};

export const useCreateForumStore = create<CreateForumStore>()(
  persist(
    (set) => ({
      forumTitle: "",
      forumDescription: "",
      selectedImage: null,
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
      setSelectedImage: (file) => set(() => ({ selectedImage: file })),
      clear: () =>
        set(() => ({
          forumTitle: "",
          forumDescription: "",
          selectedImage: null,
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
