import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../../../components/ui/search-bar/SearchBar.tsx";
import { SearchResults } from "../../../components/ui/search-bar/SearchResults.tsx";
import { SortedIdeas } from "../../../components/layout/ideas/SortedIdeas.tsx";
import { searchIdeas } from "../../../services/api/idea/idea-actions.api.ts";
import { IdeaSearchResult } from "../../../types/idea.types.ts";

export const IdeasAll = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<IdeaSearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchCache = useMemo(() => new Map(), []);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      const cacheKey = `search:${query.trim().toLowerCase()}`;
      if (searchCache.has(cacheKey)) {
        setSearchResults(searchCache.get(cacheKey));
        setShowResults(true);
        return;
      }

      try {
        const fetchedIdeas = await searchIdeas(query.trim());
        console.log(fetchedIdeas, 'fetchedIdeas');
        setSearchResults(fetchedIdeas);
        searchCache.set(cacheKey, fetchedIdeas);
        setShowResults(true);
      } catch (err) {
        console.error("Error searching ideas:", err);
        setSearchResults([]);
      }
    };

    fetchSearchResults();
  }, [query, searchCache]);

  const handleIdeaSelect = (ideaId: string) => {
    navigate(`/ideas/details/${ideaId}`);
    setShowResults(false);
  };

  return (
    <section className="ideas-page">
      <div className="ideas-page__search">
        <SearchBar
          placeholder="Search ideas..."
          onSearchChange={setQuery}
          debounceDelay={500}
          minLength={2}
          searchType="ideas"
        />
        <SearchResults
          resultsObjects={searchResults}
          isVisible={showResults && query.length >= 2}
          onSelect={handleIdeaSelect}
        />
      </div>
      <div
        className={`ideas-page__content ${
          showResults && query.length >= 2 ? "blurred" : ""
        }`}
      >
        <SortedIdeas limit={6} needPagination={true} />
      </div>
    </section>
  );
};
