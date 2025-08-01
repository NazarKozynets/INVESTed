import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useAuth} from "../../../context/AuthContext.tsx";
import {useParams} from "react-router-dom";
import {getForum} from "../../../services/api/forum/get-forums.api.ts";
import {LoadingBar} from "../../../components/ui/loading-bar/LoadingBar.tsx";
import {UserProfileIcon} from "../../../components/features/profile-icon/UserProfileIcon.tsx";
import {formatDate} from "../../../utils/functions/formatters.ts";
import {motion} from "framer-motion";
import trashIcon from "../../../assets/trash.svg";
import {format} from "date-fns";
import {
    AddCommentRequest,
    ForumCommentModel,
} from "../../../types/forum.types.ts";
import {toast} from "react-toastify";
import React, {useState} from "react";
import {TextInput} from "../../../components/ui/text-input/TextInput.tsx";
import {
    addCommentToForum, closeForum,
    deleteCommentFromForum,
} from "../../../services/api/forum/forum-actions.api.ts";
import Button from "../../../components/ui/button/Button.tsx";

export const ForumDetails = () => {
    const queryClient = useQueryClient();
    const {authState} = useAuth();
    const {forumId} = useParams();

    const [commentText, setCommentText] = useState("");

    const {
        data: forum,
        isLoading,
        isFetching,
        isError,
    } = useQuery({
        queryKey: ["forum-details", forumId],
        queryFn: () => getForum(forumId as string),
        enabled: !!forumId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    const closeForumMutation = useMutation({
        mutationFn: () => {
            if (!forumId)
                return Promise.reject(new Error("Try again later"));
            return closeForum(forumId);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["forum-details", forumId]});
            toast.success("Forum closed!");
        },
        onError: (error) => {
            console.error(error);
        },
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId: string) => {
            if (!commentId?.trim())
                return Promise.reject(new Error("Empty commentId"));
            return deleteCommentFromForum(commentId.trim());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["forum-details", forumId]});
            toast.success("Comment deleted successfully!");
        },
        onError: (error) => {
            console.error(error);
        },
    });

    const commentMutation = useMutation({
        mutationFn: (commentText: string) => {
            const reqBody: AddCommentRequest = {
                forumId: forumId as string,
                commentText: commentText.trim(),
            };
            return addCommentToForum(reqBody);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["forum-details", forumId]});
            setCommentText("");
            toast.success("Comment added successfully!");
        },
        onError: (error) => {
            console.error(error);
            toast.error("Failed to add comment.");
        },
    });

    const handleCommentSubmit = (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();
        if (commentText.trim().length === 0) return;
        commentMutation.mutate(commentText);
    };

    const renderComments = (comments: ForumCommentModel[], depth = 0) => {
        return comments
            .sort(
                (a, b) =>
                    new Date(b.commentDate).getTime() - new Date(a.commentDate).getTime(),
            )
            .map((comment, index) => {
                if (deleteCommentMutation.isPending) {
                    return <LoadingBar/>;
                } else {
                    return (
                        <motion.div
                            key={`${comment.commentatorId}-${comment.commentDate}-${index}`}
                            className={`forum-details__comment ${depth > 0 ? "forum-details__comment--reply" : ""}`}
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.3, delay: index * 0.1}}
                        >
                            <div className="forum-details__comment-header">
                                <div className="forum-details__comment-user-block">
                                    <div
                                        className="forum-details__comment-user"
                                        onClick={(e) => {
                                            if (comment.commentatorUsername) {
                                                e.stopPropagation();
                                                window.location.href = `/profile/${comment.commentatorUsername}`;
                                            }
                                        }}
                                    >
                                        <UserProfileIcon username={comment.commentatorUsername}
                                                         avatarUrl={comment.commentatorAvatarUrl}/>
                                        <span>{comment.commentatorUsername}</span>
                                    </div>
                                    {!forum?.isClosed && authState?.userData?.userId === comment.commentatorId && (
                                        <div
                                            className="forum-details__comment-delete"
                                            onClick={() => deleteCommentMutation.mutate(comment.id)}
                                        >
                                            <img src={trashIcon} alt=""/>
                                        </div>
                                    )}
                                </div>
                                <span className="forum-details__comment-date">
                  {format(new Date(comment.commentDate), "dd.MM.yyyy HH:mm")}
                </span>
                            </div>
                            <p className="forum-details__comment-text">
                                {comment.commentText}
                            </p>
                        </motion.div>
                    );
                }
            });
    };

    return (
        <section className="forum-details">
            {isError && (
                <div style={{display: "flex", justifyContent: "center"}}>
                    <h2 id="title" className="text-red-500 text-center">
                        Failed to load forum. Please try again later.
                    </h2>
                </div>
            )}

            {(isLoading || isFetching) && (
                <div style={{display: "flex", justifyContent: "center"}}>
                    <LoadingBar/>
                </div>
            )}

            {forum && !isError && !isLoading && !isFetching && (
                <div
                    className="forum-details__forum"
                    style={{
                        border: forum.isClosed ? "1px solid red" : "1px solid #ccc",
                    }}
                >
                    <div className="forum-details__header">
                        <div
                            className="forum-details__header-user"
                            onClick={(e) => {
                                if (!forum?.creatorUsername) return;
                                e.stopPropagation();
                                window.location.href = `/profile/${forum.creatorUsername}`;
                            }}
                            style={{
                                cursor: forum.creatorUsername ? "pointer" : "default",
                            }}
                        >
                            <UserProfileIcon username={forum?.creatorUsername} avatarUrl={forum?.creatorAvatarUrl}/>
                            <h3>{forum.creatorUsername ?? "Unknown User"}</h3>
                        </div>
                        <p className="forum-details__header-date">
                            {formatDate(forum.createdAt)}
                        </p>
                    </div>
                    <div className="forum-details__title">
                        <p>{forum.forumTitle}</p>
                    </div>
                    <div className="forum-details__description">
                        <p>{forum.forumDescription}</p>
                    </div>
                    {forum.imageUrl && (
                        <div className="forum-details__image">
                            <img src={forum.imageUrl} alt=""/>
                        </div>
                    )}
                    {forum.canEdit && !forum.isClosed && (
                        <Button text="Close" className="forum-details__close-btn"
                                onClick={() => closeForumMutation.mutate()}/>
                    )}
                </div>
            )}
            {forum &&
                (commentMutation.isPending ? (
                    <LoadingBar/>
                ) : (
                    <div
                        className="forum-details__comments"
                        style={{
                            border: "1px solid #ccc",
                        }}
                    >
                        <p style={{textAlign: "center", fontSize: 16}}>
                            {forum.comments.length === 0 ? "No responses yet. Be the first to answer!" : "Responses"}
                        </p>
                        {!forum.isClosed && <TextInput
                            disabled={commentMutation.isPending}
                            name="text"
                            placeholder="Respond..."
                            value={commentText}
                            setValue={setCommentText}
                            type="text"
                            showSendIcon={true}
                            onSendClick={handleCommentSubmit}
                            className="forum-details__respond-btn"
                        />}
                        {forum.comments.length > 0 && renderComments(forum.comments)}
                    </div>
                ))}
        </section>
    );
};
