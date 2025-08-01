import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getIdea } from "../../../services/api/idea/get-ideas.api.ts";
import { LoadingBar } from "../../../components/ui/loading-bar/LoadingBar.tsx";
import React, { useEffect, useState } from "react";
import { StarRating } from "../../../components/ui/star-rating/StarRating.tsx";
import { UserProfileIcon } from "../../../components/features/profile-icon/UserProfileIcon.tsx";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { useAuth } from "../../../context/AuthContext.tsx";
import {
  rateIdea,
  addCommentToIdea,
  deleteCommentFromIdea,
} from "../../../services/api/idea/idea-actions.api.ts";
import {
  RateIdeaRequest,
  AddCommentRequest,
  IdeaCommentModel,
} from "../../../types/idea.types.ts";
import { toast } from "react-toastify";
import { TextInput } from "../../../components/ui/text-input/TextInput.tsx";
import Button from "../../../components/ui/button/Button.tsx";
import { Form } from "../../../components/ui/form/Form.tsx";
import trashIcon from "../../../assets/trash.svg";
import {UserRole} from "../../../types/auth.types.ts";

export const IdeaDetails = () => {
  const queryClient = useQueryClient();
  const { authState } = useAuth();
  const { ideaId } = useParams();

  const userId = authState.userData?.userId;
  const userRole = authState.userData?.role as UserRole || "Client";

  const [isHovered, setIsHovered] = useState(false);
  const [tooltipX, setTooltipX] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [commentText, setCommentText] = useState("");

  const {
    data: idea,
    isLoading,
    isFetching,
    isError,
  } = useQuery({
    queryKey: ["idea-details", ideaId],
    queryFn: () => getIdea(ideaId as string),
    enabled: !!ideaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const rateMutation = useMutation({
    mutationFn: (rate: number) => {
      const reqBody: RateIdeaRequest = {
        ideaId: ideaId as string,
        rate,
      };
      return rateIdea(reqBody);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["idea-details", ideaId] });
      toast.success("Idea rated successfully!");
    },
  });

  const commentMutation = useMutation({
    mutationFn: (commentText: string) => {
      const reqBody: AddCommentRequest = {
        ideaId: ideaId as string,
        commentText: commentText.trim(),
      };
      return addCommentToIdea(reqBody);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["idea-details", ideaId] });
      setCommentText("");
      toast.success("Comment added successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to add comment.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => {
      if (!commentId?.trim())
        return Promise.reject(new Error("Empty commentId"));
      return deleteCommentFromIdea(commentId.trim());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["idea-details", ideaId] });
      toast.success("Comment deleted successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete comment.");
    },
  });

  useEffect(() => {
    if (idea) {
      setProgressPercentage(
        Math.min((idea.alreadyCollected / idea.targetAmount) * 100, 100),
      );
    }
  }, [idea?.alreadyCollected]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    setTooltipX(relativeX);
  };

  const handleRatingChange = (newRating: number) => {
    rateMutation.mutate(newRating);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commentMutation.mutate(commentText);
  };

  const handleGoToPaymentPage = () => {
    window.location.href = `/ideas/details/payment/${ideaId}`;
  };

  const renderComments = (comments: IdeaCommentModel[], depth = 0) => {
    return comments
      .sort(
        (a, b) =>
          new Date(b.commentDate).getTime() - new Date(a.commentDate).getTime(),
      )
      .map((comment, index) => {
        if (deleteCommentMutation.isPending) {
          return <LoadingBar />;
        } else {
          return (
            <motion.div
              key={`${comment.commentatorId}-${comment.commentDate}-${index}`}
              className={`idea-details__comment ${depth > 0 ? "idea-details__comment--reply" : ""}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="idea-details__comment-header">
                <div className="idea-details__comment-user-block">
                  <div
                    className="idea-details__comment-user"
                    onClick={(e) => {
                      if (comment.commentatorUsername) {
                        e.stopPropagation();
                        window.location.href = `/profile/${comment.commentatorUsername}`;
                      }
                    }}
                  >
                    <UserProfileIcon username={comment.commentatorUsername} avatarUrl={comment.commentatorAvatarUrl}/>
                    <span>{comment.commentatorUsername}</span>
                  </div>
                  {(userId === comment.commentatorId || userRole !== "Client") && (
                    <div
                      className="idea-details__comment-delete"
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                    >
                      <img src={trashIcon} alt="" />
                    </div>
                  )}
                </div>
                <span className="idea-details__comment-date">
                  {format(new Date(comment.commentDate), "dd.MM.yyyy HH:mm")}
                </span>
              </div>
              <p className="idea-details__comment-text">
                {comment.commentText}
              </p>
            </motion.div>
          );
        }
      });
  };

  return (
    <section className="idea-details">
      {isError && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h2 id="title" className="text-red-500 text-center">
            Failed to load idea. Please try again.
          </h2>
        </div>
      )}

      {(isLoading || isFetching) && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <LoadingBar />
        </div>
      )}

      {idea && !isLoading && !isFetching && !isError && (
        <div>
          <div className="idea-details__header">
            <p
              className="idea-details__header-title"
              style={{ color: idea.isClosed ? "red" : "white" }}
            >
              {idea.ideaName}
            </p>
            {idea.creatorUsername && (
              <div
                className="idea-details__header-user"
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/profile/${idea.creatorUsername}`;
                }}
              >
                <h3>{idea.creatorUsername}</h3>
                <UserProfileIcon username={idea.creatorUsername} avatarUrl={idea.creatorAvatarUrl}/>
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
              style={{ width: `${progressPercentage}%` }}
            />
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="idea-details__progress-tooltip"
                  style={{ left: tooltipX, transform: "translateX(-50%)" }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
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
            onRatingChange={handleRatingChange}
            interactive={!!userId && !idea.isClosed}
          />
          <div className="idea-details__footer">
            <p>TARGET SUM: ${idea.targetAmount}</p>
            <p>
              EXPIRATION DATE:{" "}
              {format(new Date(idea.fundingDeadline), "dd.MM.yyyy")}
            </p>
          </div>
          {(userRole == "Client" && !idea.canEdit) || userRole === "Moderator" && (
            <Button text="Invest" onClick={handleGoToPaymentPage} />
          )}
          <div className="idea-details__comments">
            <h2 style={{ textAlign: "center" }}>Comments</h2>
            {!idea.isClosed &&
              (commentMutation.isPending ? (
                <LoadingBar />
              ) : (
                <Form className="idea-details__add-comment">
                  <TextInput
                    disabled={commentMutation.isPending}
                    name="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    setValue={setCommentText}
                    type="text"
                  />
                  {commentText?.length > 0 && (
                    <Button
                      className="idea-details__add-comment--button"
                      onClick={handleCommentSubmit}
                      text="Post Comment"
                    />
                  )}
                </Form>
              ))}
            {idea.comments && idea.comments.length > 0 ? (
              renderComments(idea.comments)
            ) : idea.isClosed ? null : (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
