import { IdeaSearchResult } from "./idea.types.ts";
import { ForumSearchResult } from "./forum.types.ts";
import {ClientsSearchResult} from "./profile.types.ts";

type NormalizedSearchResult = {
  id: string;
  creatorUsername: string;
  type: string;
  creatorAvatarUrl?: string | null;
  title?: string;
  isClosed?: boolean;
};

export type RawSearchResult = IdeaSearchResult | ForumSearchResult | ClientsSearchResult;

export function normalizeResult(
  result: RawSearchResult,
): NormalizedSearchResult {
  if ("ideaName" in result) {
    return {
      id: result.id,
      title: result.ideaName,
      creatorUsername: result.creatorUsername,
      type: "idea",
      isClosed: result.isClosed,
      creatorAvatarUrl: result.creatorAvatarUrl,
    };
  }

  if ("forumTitle" in result) {
    return {
      id: result.id,
      title: result.forumTitle,
      creatorUsername: result.creatorUsername,
      type: "forum",
      isClosed: result.isClosed,
      creatorAvatarUrl: result.creatorAvatarUrl,
    };
  }

  if ("isBanned" in result) {
    return {
      id: result.id,
      creatorUsername: result.username,
      creatorAvatarUrl: result.avatarUrl,
      isClosed: result.isBanned,
      type: "user",
    }
  }

  throw new Error("Unknown result type");
}
