import {ClientsSearchResult, GetClientsResponse} from "../../../types/profile.types.ts";
import {useRequest} from "../../../utils/hooks/useRequest.ts";

export const getClients = async (): Promise<GetClientsResponse> => {
    return await useRequest<GetClientsResponse>("profile/get/clients", "get");
};

export const searchClients = async (
    query: string,
    limit = 6,
): Promise<ClientsSearchResult[]> => {
    const res = await useRequest<{
        clients: ClientsSearchResult[];
        total: number;
        limit: number;
    }>(`profile/search?query=${encodeURIComponent(query)}&limit=${limit}`, "get");
    return res?.clients || [];
};