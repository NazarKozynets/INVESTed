import {RateIdeaRequest} from "../../types/idea.types.ts";
import {useRequest} from "../../utils/hooks/useRequest.ts";

export const rateIdea = async (reqBody: RateIdeaRequest) => {
    const res = await useRequest(`idea/rate`, "put", reqBody);
    console.log(res, 'res')
    return res;
}