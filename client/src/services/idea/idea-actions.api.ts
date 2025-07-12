import {
  AddCommentRequest,
  IdeaCommentModel,
  IdeaSearchResult,
  InvestIdeaRequest,
  RateIdeaRequest,
} from "../../types/idea.types.ts";
import { useRequest } from "../../utils/hooks/useRequest.ts";

export const rateIdea = async (reqBody: RateIdeaRequest) => {
  return await useRequest(`idea/rate`, "post", reqBody);
};

export const addCommentToIdea = async (
  reqBody: AddCommentRequest,
): Promise<IdeaCommentModel> => {
  return await useRequest(`idea/add-comment`, "post", reqBody);
};

export const investIdea = async (reqBody: InvestIdeaRequest) => {
  return await useRequest(`idea/invest`, "post", reqBody);
};

export const deleteCommentFromIdea = async (commentId: string) => {
  return await useRequest(
    `idea/delete-comment?commentId=${encodeURIComponent(commentId)}`,
    "delete",
  );
};

export const searchIdeas = async (
  query: string,
  limit = 6,
  sortBy = "Rating",
  sortOrder = "desc",
): Promise<IdeaSearchResult[]> => {
  const res = await useRequest<{
    ideas: IdeaSearchResult[];
    total: number;
    limit: number;
  }>(
    `idea/search?query=${encodeURIComponent(query)}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
    "get",
  );
  return res?.ideas || [];
};
