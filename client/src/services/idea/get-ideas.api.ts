import {useRequest} from "../../utils/hooks/useRequest.ts";
import {
    GetLimitedAmountOfSortedIdeasResponse,
    IdeaType,
    SortIdeaByField,
    SortIdeaOrder
} from "../../types/idea.types.ts";

export const getAllClientIdeas = async (clientId: string): Promise<Array<IdeaType>> => {
    return await useRequest(`idea/get/all/${clientId}`, "get");
}

export const getLimitedAmountOfSortedIdeas = async (
    page: number = 1,
    limit: number = 10,
    sortBy: SortIdeaByField = 'Rating',
    sortOrder: SortIdeaOrder = 'desc'
): Promise<GetLimitedAmountOfSortedIdeasResponse> => {
    const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
    }).toString();

    const res = await useRequest<GetLimitedAmountOfSortedIdeasResponse>(`idea/get/sorted?${queryParams}`, 'get');
    console.log(res)
    return res;
};