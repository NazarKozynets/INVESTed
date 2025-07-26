import { UserProfileIcon } from "../../features/profile-icon/UserProfileIcon.tsx";
import {
  normalizeResult,
  RawSearchResult,
} from "../../../types/search-result.types.ts";

type SearchResultsProps = {
  resultsObjects: RawSearchResult[];
  isVisible: boolean;
  onSelect: (id: string) => void;
};

export const SearchResults = ({
  resultsObjects,
  isVisible,
  onSelect,
}: SearchResultsProps) => {
  if (!isVisible || resultsObjects?.length === 0) return null;

  return (
    <div className="search-results">
      {resultsObjects.map((item, index) => {
        const normalized = normalizeResult(item);
        return (
          <div
            key={index}
            onClick={() => onSelect(normalized.id)}
            className="search-results__item"
          >
            <div className="search-results__item-creator">
              <UserProfileIcon username={normalized.creatorUsername} />
              <p>{normalized.creatorUsername}</p>
            </div>
            <div className="search-results__item-idea">
              <p>{normalized.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
