import {useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getIdea} from "../../services/idea/get-ideas.api.ts";
import {LoadingBar} from "../../components/ui/loading-bar/LoadingBar.tsx";
import React, {useEffect, useState} from "react";
import {StarRating} from "../../components/ui/star-rating/StarRating.tsx";
import {UserProfileIcon} from "../../components/features/profile-icon/UserProfileIcon.tsx";
import {AnimatePresence, motion} from "framer-motion";
import {format} from "date-fns";
import {useAuth} from "../../context/AuthContext.tsx";
import {rateIdea} from "../../services/idea/idea-actions.api.ts";
import {RateIdeaRequest} from "../../types/idea.types.ts";

export const IdeaDetails = () => {
    const { authState } = useAuth();
    const {ideaId} = useParams();

    const userId = authState.userData?.userId;

    const [isHovered, setIsHovered] = useState(false);
    const [tooltipX, setTooltipX] = useState(0);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const queryClient = useQueryClient();

    const {
        data: idea,
        isLoading,
        isFetching,
        isError
    } = useQuery({
        queryKey: ['idea-details', ideaId],
        queryFn: () => getIdea(ideaId as string),
        enabled: !!ideaId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1
    });

    const mutation = useMutation({
        mutationFn: (rate: number) => {
            const reqBody: RateIdeaRequest = {
                ideaId: ideaId as string,
                ratedBy: userId as string,
                rate,
            };
            return rateIdea(reqBody);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['idea-details', ideaId] });
        },
    });

    useEffect(() => {
        console.log(idea)
    }, [idea])

    useEffect(() => {
        if (idea) {
            setProgressPercentage(Math.min(
                (idea.alreadyCollected / idea.targetAmount) * 100,
                100
            ))
        }
    }, [idea?.alreadyCollected])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        setTooltipX(relativeX);
    };

    const handleRatingChange = (newRating: number) => {
        mutation.mutate(newRating);
    };

    return (
        <section>
            {isError && (
                <h2 id="title" style={{color: 'red', textAlign: 'center'}}>Failed to load ideas. Please try again.</h2>
            )}

            {isLoading || isFetching && (
                <LoadingBar/>
            )}

            {idea && !isLoading && !isFetching && !isError && (
                <div className="idea-details">
                    <div className="idea-details__header">
                        <p className="idea-details__header-title">{idea.ideaName}</p>
                        {idea.creatorUsername && (
                            <div
                                className="idea-details__header-user"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/profile/${idea.creatorUsername}`;
                                }}
                            >
                                <h3>{idea.creatorUsername}</h3>
                                <UserProfileIcon username={idea.creatorUsername}/>
                            </div>
                        )}
                    </div>
                    <div
                        className="idea-details__progress-container"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onMouseMove={handleMouseMove}
                    >
                        <div
                            className="idea-details__progress-bar"
                            style={{
                                width: `${progressPercentage}%`
                            }}
                        />
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    className="idea-details__progress-tooltip"
                                    style={{left: tooltipX, transform: 'translateX(-50%)'}}
                                    initial={{opacity: 0, y: -10}}
                                    animate={{opacity: 1, y: 0}}
                                    exit={{opacity: 0, y: -10}}
                                    transition={{duration: 0.2}}
                                >
                                    Collected: ${idea.alreadyCollected}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="idea-details__desc">
                        <p>{idea.ideaDescription}</p>
                    </div>
                    <StarRating
                        className="idea-details__rating"
                        rating={idea.averageRating}
                        interactive={!!userId}
                        onRatingChange={handleRatingChange}
                    />
                    <div className="idea-details__footer">
                        <p>TARGET SUM: {idea.targetAmount}$</p>
                        <p>EXPIRATION DATE: {format(new Date(idea.fundingDeadline), 'dd.MM.yyyy')}</p>
                    </div>
                    <div className="idea-details__comments">comments section...</div>
                </div>
            )}
        </section>
    );
};