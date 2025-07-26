import { useRequest } from "../../../utils/hooks/useRequest.ts";
import {
  ForumType,
  GetLimitedAmountOfSortedForumsResponse,
  SortForumByField,
  SortForumOrder,
} from "../../../types/forum.types.ts";

export const getAllClientForums = async (
  clientId: string,
): Promise<Array<ForumType>> => {
  return await useRequest(`forum/get/all/${clientId}`, "get");
};

export const getForum = async (forumId: string): Promise<ForumType> => {
  return await useRequest(`forum/get/${forumId}`, "get");
};

export const getLimitedAmountOfSortedForums = async (
  page: number = 1,
  limit: number = 6,
  sortBy: SortForumByField = "CreatedAt",
  sortOrder: SortForumOrder = "desc",
): Promise<GetLimitedAmountOfSortedForumsResponse> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  }).toString();

  return await useRequest<GetLimitedAmountOfSortedForumsResponse>(
    `forum/get/sorted?${queryParams}`,
    "get",
  );
};
