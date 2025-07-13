import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getLimitedAmountOfSortedIdeas } from "../../../services/api/idea/get-ideas.api.ts";
import {
  GetLimitedAmountOfSortedIdeasResponse,
  IdeaType,
  SortIdeaOption,
  sortIdeasOptions,
  sortMappings,
} from "../../../types/idea.types.ts";
import { Idea } from "../../features/ideas/Idea.tsx";
import { DropdownMenu } from "../../ui/dropdown-menu/DropdownMenu.tsx";
import { useEffect, useState } from "react";
import { LoadingBar } from "../../ui/loading-bar/LoadingBar.tsx";
import { AnimatePresence, motion } from "framer-motion";

interface SortedIdeasProps {
  limit?: number;
  needPagination?: boolean;
  seeMoreBtnOnClick?: () => void;
}

export const SortedIdeas = ({
  limit = 4,
  needPagination = false,
  seeMoreBtnOnClick,
}: SortedIdeasProps) => {
  const [selectedSortMethod, setSelectedSortMethod] =
    useState<SortIdeaOption>("Best Rated");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const sortConfig = sortMappings[selectedSortMethod];

  const { data, isError, isLoading, isFetching } = useQuery<
    GetLimitedAmountOfSortedIdeasResponse,
    Error
  >({
    queryKey: [
      `${!needPagination ? "homeIdeas" : "sortedIdeas"}`,
      1,
      selectedSortMethod,
    ],
    queryFn: () =>
      getLimitedAmountOfSortedIdeas(
        1,
        limit,
        sortConfig.sortBy,
        sortConfig.sortOrder,
      ),
    placeholderData: keepPreviousData,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!selectedSortMethod,
  });

  return (
    <section className="sorted-ideas">
      <div className="sorted-ideas__header">
        {hasMounted ? (
          <>
            <motion.h2
              id="title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {selectedSortMethod.toUpperCase()} IDEAS
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            >
              <DropdownMenu
                options={[...sortIdeasOptions]}
                onSelect={setSelectedSortMethod}
                placeholder={selectedSortMethod}
              />
            </motion.div>
          </>
        ) : (
          <>
            <h2 id="title">{selectedSortMethod.toUpperCase()} IDEAS</h2>
            <div>
              <DropdownMenu
                options={[...sortIdeasOptions]}
                onSelect={setSelectedSortMethod}
                placeholder={selectedSortMethod}
              />
            </div>
          </>
        )}
      </div>

      {(isLoading || isFetching) && (
        <LoadingBar
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      {isError && (
        <h2 id="title" style={{ color: "red", textAlign: "center" }}>
          Failed to load ideas. Please try again.
        </h2>
      )}

      <AnimatePresence mode="wait">
        {!isLoading && !isFetching && !isError && data && (
          <motion.div
            key={selectedSortMethod}
            className="sorted-ideas__ideas-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {data.ideas.length === 0 ? (
              <p>No ideas found.</p>
            ) : (
              data.ideas.map((idea: IdeaType, index: number) => (
                <Idea idea={idea} key={index} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {seeMoreBtnOnClick &&
        !isLoading &&
        !isFetching &&
        !isError &&
        data?.ideas &&
        data.ideas.length > 0 && (
          <p className="sorted-ideas__see-more-btn" onClick={seeMoreBtnOnClick}>
            See More...
          </p>
        )}
    </section>
  );
};
