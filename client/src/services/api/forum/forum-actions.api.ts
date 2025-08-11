import { useRequest } from "../../../utils/hooks/useRequest.ts";
import {
  AddCommentRequest,
  ForumCommentModel,
  ForumSearchResult,
} from "../../../types/forum.types.ts";

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

export const deleteCommentFromForum = async (commentId: string) => {
  return await useRequest(
    `forum/delete-comment?commentId=${encodeURIComponent(commentId)}`,
    "delete",
  );
};

export const closeForum = async (forumId: string) => {
  return await useRequest(`forum/close/${forumId}`, "patch");
};

export const changeCommentHelpfulStatus = async (commentId: string) => {
  return await useRequest(
    `forum/comment-change-helpful-status/${commentId}`,
    "patch",
  );
};
