import { StartIdeaRequest } from "../../../types/idea.types.ts";
import { useRequest } from "../../../utils/hooks/useRequest.ts";

export const startIdea = async (data: StartIdeaRequest): Promise<any> => {
  return await useRequest("idea/start", "post", data);
};
