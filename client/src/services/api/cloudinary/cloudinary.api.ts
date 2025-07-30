import { UploadImageRequest } from "../../../types/cloudinary.types.ts";
import axios from "axios";

export const uploadImageFile = async ({
  file,
  folderType,
}: UploadImageRequest) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folderType);

  const { data } = await axios.post(
    `${import.meta.env.VITE_API_URL}/cloudinary/upload/image`,
    formData,
    {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data.url || null;
};
