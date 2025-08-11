import { IdeaSearchResult } from "./idea.types.ts";
import { ForumSearchResult } from "./forum.types.ts";

type NormalizedSearchResult = {
  id: string;
  title: string;
  creatorUsername: string;
  type: string;
  creatorAvatarUrl?: string | null;
  isClosed?: boolean;
};

export type RawSearchResult = IdeaSearchResult | ForumSearchResult;

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

  throw new Error("Unknown result type");
}
