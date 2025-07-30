export const CloudinaryError = {
  FILE_MISSING: "Missing file",
  UPLOAD_FAILED: "Something went wrong",
} as const;

export type CloudinaryErrorCode = keyof typeof CloudinaryError;

export const getCloudinaryErrorMessage = (
  code?: string,
  fallback = "An unexpected error occurred. Please try again later.",
): string =>
  code && code in CloudinaryError
    ? CloudinaryError[code as CloudinaryErrorCode]
    : fallback;

export enum CloudinaryFolderType {
  Forums = "Forums",
  Avatars = "Avatars",
  Comments = "Comments",
}

export interface UploadImageRequest {
  file: File;
  folderType: string;
}
