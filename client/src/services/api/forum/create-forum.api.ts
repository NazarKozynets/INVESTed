import { useRequest } from "../../../utils/hooks/useRequest.ts";
import { CreateForumRequest } from "../../../types/forum.types.ts";

export const createForum = async (data: CreateForumRequest): Promise<any> => {
  return await useRequest("forum/create", "post", data);
};
