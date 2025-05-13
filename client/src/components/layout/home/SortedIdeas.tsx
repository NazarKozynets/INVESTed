import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getLimitedAmountOfSortedIdeas } from '../../../services/idea/get-ideas.api.ts';
import {
    GetLimitedAmountOfSortedIdeasResponse,
    IdeaType, SortIdeaOption,
    sortIdeasOptions,
    sortMappings
} from '../../../types/idea.types.ts';
import { LoadingOverlay } from '../../ui/loading-overlay/LoadingOverlay.tsx';
import { Idea } from '../../features/ideas/Idea.tsx';
import {DropdownMenu} from "../../ui/dropdown-menu/DropdownMenu.tsx";
import {useState} from "react";
import {LoadingBar} from "../../ui/loading-bar/LoadingBar.tsx";

interface SortedIdeasProps {
    limit?: number;
    needPagination?: boolean;
}

export const SortedIdeas = ({limit = 4, needPagination = false}: SortedIdeasProps) => {
    const [selectedSortMethod, setSelectedSortMethod] = useState<SortIdeaOption>('Best Rated');

    const sortConfig = sortMappings[selectedSortMethod];

    const { data, isError, isLoading, isFetching } = useQuery<GetLimitedAmountOfSortedIdeasResponse, Error>({
        queryKey: [`${!needPagination ? "homeIdeas" : "sortedIdeas"}`, 1, selectedSortMethod],
        queryFn: () => getLimitedAmountOfSortedIdeas(1, limit, sortConfig.sortBy, sortConfig.sortOrder),
        placeholderData: keepPreviousData,
        retry: 1,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!selectedSortMethod,
    });

    if (isLoading || isFetching) return <LoadingBar style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    }}/>;
    if (isError) return <h2 id="title" style={{ color: 'red', textAlign: 'center' }}>Failed to load ideas. Please try again.</h2>;

    return (
        <section className="sorted-ideas">
            <div className="sorted-ideas__header">
                <h2 id="title">{selectedSortMethod.toUpperCase()} IDEAS</h2>
                <DropdownMenu
                    options={[...sortIdeasOptions]}
                    onSelect={setSelectedSortMethod}
                    placeholder={selectedSortMethod}
                />
            </div>

            {!isLoading && !isError && data && (
                <div className="sorted-ideas__ideas-list">
                    {data.ideas.length === 0 ? (
                        <p>No ideas found.</p>
                    ) : (
                        data.ideas.map((idea: IdeaType, index: number) => (
                            <Idea idea={idea} key={index} />
                        ))
                    )}
                </div>
            )}

            {isFetching && !isLoading && <LoadingOverlay />}
        </section>
    );
};