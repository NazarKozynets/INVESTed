import { IdeaSearchResult } from "./idea.types.ts";
import { ForumSearchResult } from "./forum.types.ts";

type NormalizedSearchResult = {
  id: string;
  title: string;
  creatorUsername: string;
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
    };
  }

  if ("forumTitle" in result) {
    return {
      id: result.id,
      title: result.forumTitle,
      creatorUsername: result.creatorUsername,
    };
  }

  throw new Error("Unknown result type");
}
