import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../../../components/ui/search-bar/SearchBar.tsx";
import { SearchResults } from "../../../components/ui/search-bar/SearchResults.tsx";
import { searchForums } from "../../../services/api/forum/forum-actions.api.ts";
import { ForumSearchResult } from "../../../types/forum.types.ts";
import { SortedForums } from "../../../components/layout/forums/SortedForums.tsx";

export const ForumsAll = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ForumSearchResult[]>([]);
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
        const fetchedForums = await searchForums(query.trim());
        setSearchResults(fetchedForums);
        searchCache.set(cacheKey, fetchedForums);
        setShowResults(true);
      } catch (err) {
        console.error("Error searching forums:", err);
        setSearchResults([]);
      }
    };

    fetchSearchResults();
  }, [query, searchCache]);

  const handleForumSelect = (forumId: string) => {
    navigate(`/forums/details/${forumId}`);
    setShowResults(false);
  };

  return (
    <section className="ideas-page">
      <div className="ideas-page__search">
        <SearchBar
          placeholder="Search forums..."
          onSearchChange={setQuery}
          debounceDelay={500}
          minLength={5}
          searchType="forums"
        />
        <SearchResults
          resultsObjects={searchResults}
          isVisible={showResults && query.length >= 2}
          onSelect={handleForumSelect}
        />
      </div>
      <div
        className={`ideas-page__content ${
          showResults && query.length >= 2 ? "blurred" : ""
        }`}
      >
        <SortedForums limit={5} needPagination={true} />
      </div>
    </section>
  );
};
