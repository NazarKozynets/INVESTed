import { UserProfileIcon } from "../../features/profile-icon/UserProfileIcon.tsx";
import { IdeaSearchResult } from "../../../types/idea.types.ts";

type SearchResultsProps = {
  ideas: IdeaSearchResult[];
  isVisible: boolean;
  onSelect: (ideaId: string) => void;
};

export const SearchResults = ({
  ideas,
  isVisible,
  onSelect,
}: SearchResultsProps) => {
  if (!isVisible || ideas?.length === 0) return null;

  return (
    <div className="search-results">
      {ideas.map((idea) => (
        <div
          key={idea.id}
          onClick={() => onSelect(idea.id)}
          className="search-results__item"
        >
          <div className="search-results__item-creator">
            <UserProfileIcon username={idea.creatorUsername} />
            <p>{idea.creatorUsername}</p>
          </div>
          <div className="search-results__item-idea">
            <p>{idea.ideaName}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
