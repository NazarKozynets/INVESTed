import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { LoadingBar } from "../../ui/loading-bar/LoadingBar.tsx";
import { AnimatePresence, motion } from "framer-motion";
import {getClients } from "../../../services/api/profile/clients-page.api.ts";
import {GetClientsResponse, GetProfileResponseData} from "../../../types/profile.types.ts";
import {ClientCard} from "./ClientCard.tsx";

export const SortedClients = () => {
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    const { data, isError, isLoading, isFetching } = useQuery<
        GetClientsResponse,
        Error
    >({
        queryKey: [`clients`],
        queryFn: () => getClients(),
        placeholderData: keepPreviousData,
        retry: 1,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return (
        <section className="sorted-clients">
            <div className="sorted-clients__header">
                {hasMounted ? (
                    <>
                        <motion.h2
                            id="title"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            CLIENTS
                        </motion.h2>
                    </>
                ) : (
                    <>
                        <h2 id="title">CLIENTS</h2>
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
                    Failed to load clients. Please try again.
                </h2>
            )}

            <AnimatePresence mode="wait">
                {!isLoading && !isFetching && !isError && data && (
                    <motion.div
                        key={`clients`}
                        className="sorted-clients__clients-list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                    >
                        {data.clients.length === 0 ? (
                            <p>No clients found.</p>
                        ) : (
                            data.clients.map((client: GetProfileResponseData, index: number) => (
                                <ClientCard client={client} key={index} />
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
