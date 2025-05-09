import {GetAllClientIdeasResponse} from "../../types/idea.types.ts";
import {useRequest} from "../../utils/hooks/useRequest.ts";

export const getAllClientIdeas = async (clientId: string): Promise<GetAllClientIdeasResponse> => {
    const res: GetAllClientIdeasResponse = await useRequest(`idea/get/all/${clientId}`, "get");
    console.log(res, 'res of getting ideas')
    return res;
}