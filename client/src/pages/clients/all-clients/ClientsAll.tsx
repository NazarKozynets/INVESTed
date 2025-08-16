import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../../../components/ui/search-bar/SearchBar.tsx";
import { SearchResults } from "../../../components/ui/search-bar/SearchResults.tsx";
import {SortedClients} from "../../../components/layout/clients-page/SortedClients.tsx";
import {useAuth} from "../../../context/AuthContext.tsx";
import {searchClients} from "../../../services/api/profile/clients-page.api.ts";
import {ClientsSearchResult} from "../../../types/profile.types.ts";

export const ClientsAll = () => {
    const { authState, checkSession } = useAuth();

    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ClientsSearchResult[]>([]);
    const [showResults, setShowResults] = useState(false);
    const searchCache = useMemo(() => new Map(), []);
    const navigate = useNavigate();

    useEffect(() => {
        checkSession().then(() => {
            if (authState.userData?.role !== "Admin")
                navigate("/home")
        })
    }, [checkSession, navigate]);

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
                const fetchedClients = await searchClients(query.trim());
                setSearchResults(fetchedClients);
                searchCache.set(cacheKey, fetchedClients);
                setShowResults(true);
            } catch (err) {
                console.error("Error searching forums:", err);
                setSearchResults([]);
            }
        };

        fetchSearchResults();
    }, [query, searchCache]);

    const handleClientSelect = (creatorUsername: string) => {
        navigate(window.location.href = `/profile/${creatorUsername}`);
        setShowResults(false);
    };

    return (
        <section className="ideas-page">
            <div className="ideas-page__search">
                <SearchBar
                    placeholder="Search clients..."
                    onSearchChange={setQuery}
                    debounceDelay={500}
                    minLength={2}
                    searchType="users"
                />
                <SearchResults
                    resultsObjects={searchResults}
                    isVisible={showResults && query.length >= 2}
                    onSelect={handleClientSelect}
                />
            </div>
            <div
                className={`ideas-page__content ${
                    showResults && query.length >= 2 ? "blurred" : ""
                }`}
            >
                <SortedClients />
            </div>
        </section>
    );
};
