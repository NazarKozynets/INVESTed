import { useRequest } from "../../../utils/hooks/useRequest.ts";
import {
  ForumCommentModel,
  ForumSearchResult,
} from "../../../types/forum.types.ts";
import { AddCommentRequest } from "../../../types/idea.types.ts";

export const searchForums = async (
  query: string,
  limit = 6,
): Promise<ForumSearchResult[]> => {
  const res = await useRequest<{
    forums: ForumSearchResult[];
    total: number;
    limit: number;
  }>(`forum/search?query=${encodeURIComponent(query)}&limit=${limit}`, "get");
  return res?.forums || [];
};

export const addCommentToForum = async (
  reqBody: AddCommentRequest,
): Promise<ForumCommentModel> => {
  return await useRequest(`forum/add-comment`, "post", reqBody);
};
