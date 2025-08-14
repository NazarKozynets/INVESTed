import { useRequest } from "../../../utils/hooks/useRequest.ts";
import {
  GetProfileResponseData,
  UpdateProfileFieldsRequestData, UpdateUserRoleRequestData,
} from "../../../types/profile.types.ts";
import {UserRole, userRoleMap} from "../../../types/auth.types.ts";

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

export const banUser = async (userId: string) => {
  if (!userId) throw new Error("Invalid userId!");
  const res = await useRequest<{ isBanned: boolean }>(
    `profile/ban-status/${userId}`,
    "patch",
  );
  return res.isBanned;
};

export const updateUserRole = async (
    data: { userId: string; newRole: UserRole },
)=> {
  if (!data.userId) throw new Error("Something went wrong");

  const payload: UpdateUserRoleRequestData = {
    id: data.userId,
    newRole: userRoleMap[data.newRole],
  };

  return await useRequest(`profile/update-role`, "patch", payload);
}