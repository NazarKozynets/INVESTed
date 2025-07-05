import { useRequest } from "../../utils/hooks/useRequest.ts";
import {
  GetLimitedAmountOfSortedIdeasResponse,
  IdeaType,
  SortIdeaByField,
  SortIdeaOrder,
} from "../../types/idea.types.ts";

export const getAllClientIdeas = async (
  clientId: string,
): Promise<Array<IdeaType>> => {
  return await useRequest(`idea/get/all/${clientId}`, "get");
};

export const getIdea = async (ideaId: string): Promise<IdeaType> => {
  return await useRequest(`idea/get/${ideaId}`, "get");
};

export const getLimitedAmountOfSortedIdeas = async (
  page: number = 1,
  limit: number = 6,
  sortBy: SortIdeaByField = "Rating",
  sortOrder: SortIdeaOrder = "desc",
): Promise<GetLimitedAmountOfSortedIdeasResponse> => {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  }).toString();

  return await useRequest<GetLimitedAmountOfSortedIdeasResponse>(
    `idea/get/sorted?${queryParams}`,
    "get",
  );
};
