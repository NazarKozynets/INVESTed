import {StartIdeaRequest} from "../../types/idea.types.ts";
import {useRequest} from "../../utils/hooks/useRequest.ts";

export const startIdea = async (data: StartIdeaRequest): Promise<any> => {
    const res = await useRequest('idea/start', "post", data);
    console.log(res, 'res of starting idea')
    return res;
}