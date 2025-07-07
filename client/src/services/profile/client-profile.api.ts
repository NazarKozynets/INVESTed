import { useRequest } from "../../utils/hooks/useRequest.ts";
import {
  GetProfileResponseData,
  UpdateProfileFieldsRequestData,
} from "../../types/profile.types.ts";

export const getProfileData = async (
  username: string,
): Promise<GetProfileResponseData> =>
  await useRequest<GetProfileResponseData>(
    `profile/${username}`,
    "get",
    username,
  );

export const updateProfileFields = async (
  data: UpdateProfileFieldsRequestData,
) => {
  if (!data.id) throw new Error("Something went wrong");
  return await useRequest(`profile/update/fields`, "put", data);
};
