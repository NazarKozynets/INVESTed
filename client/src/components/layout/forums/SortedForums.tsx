import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DropdownMenu } from "../../ui/dropdown-menu/DropdownMenu.tsx";
import { useEffect, useState } from "react";
import { LoadingBar } from "../../ui/loading-bar/LoadingBar.tsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  ForumType,
  GetLimitedAmountOfSortedForumsResponse,
  SortForumOption,
  sortForumsOptions,
  sortMappings,
} from "../../../types/forum.types.ts";
import { getLimitedAmountOfSortedForums } from "../../../services/api/forum/get-forums.api.ts";
import { ForumCard } from "./ForumCard.tsx";

interface SortedForumsProps {
  limit?: number;
  needPagination?: boolean;
  seeMoreBtnOnClick?: () => void;
}

export const SortedForums = ({
  limit = 5,
  needPagination = false,
  seeMoreBtnOnClick,
}: SortedForumsProps) => {
  const [selectedSortMethod, setSelectedSortMethod] =
    useState<SortForumOption>("Newest");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const sortConfig = sortMappings[selectedSortMethod];

  const { data, isError, isLoading, isFetching } = useQuery<
    GetLimitedAmountOfSortedForumsResponse,
    Error
  >({
    queryKey: [
      `${!needPagination ? "homeForums" : "sortedForums"}`,
      1,
      selectedSortMethod,
    ],
    queryFn: () =>
      getLimitedAmountOfSortedForums(
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
    <section className="sorted-forums">
      <div className="sorted-forums__header">
        {hasMounted ? (
          <>
            <motion.h2
              id="title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {selectedSortMethod.toUpperCase()} FORUMS
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            >
              <DropdownMenu
                options={[...sortForumsOptions]}
                onSelect={setSelectedSortMethod}
                placeholder={selectedSortMethod}
              />
            </motion.div>
          </>
        ) : (
          <>
            <h2 id="title">{selectedSortMethod.toUpperCase()} FORUMS</h2>
            <div>
              <DropdownMenu
                options={[...sortForumsOptions]}
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
          Failed to load forums. Please try again.
        </h2>
      )}

      <AnimatePresence mode="wait">
        {!isLoading && !isFetching && !isError && data && (
          <motion.div
            key={selectedSortMethod}
            className="sorted-forums__forums-list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {data.forums.length === 0 ? (
              <p>No forums found.</p>
            ) : (
              data.forums.map((forum: ForumType, index: number) => (
                <ForumCard forum={forum} key={index} />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {seeMoreBtnOnClick &&
        !isLoading &&
        !isFetching &&
        !isError &&
        data?.forums &&
        data.forums.length > 0 && (
          <p className="sorted-ideas__see-more-btn" onClick={seeMoreBtnOnClick}>
            See More...
          </p>
        )}
    </section>
  );
};
