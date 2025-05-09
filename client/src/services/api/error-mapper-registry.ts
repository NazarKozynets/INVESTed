import {getAuthErrorMessage} from "../../types/auth.types.ts";
import {getProfileErrorMessage} from "../../types/profile.types.ts";
import {getIdeaErrorMessage} from "../../types/idea.types.ts";

export type ErrorMapper = (code: string | undefined, fallback: string) => string;

const registry = new Map<string, ErrorMapper>();

export const registerErrorMapper = (service: string, mapper: ErrorMapper) => {
    registry.set(service, mapper);
};

export const getErrorMapper = (service: string): ErrorMapper | undefined =>
    registry.get(service);


registerErrorMapper("auth", getAuthErrorMessage);
registerErrorMapper("profile", getProfileErrorMessage);
registerErrorMapper("idea", getIdeaErrorMessage);
