import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IdeaType } from "../../../types/idea.types.ts";
import { format } from "date-fns";
import "./idea-card.scss";
import { UserProfileIcon } from "../../features/profile-icon/UserProfileIcon.tsx";
import { StarRating } from "../../ui/star-rating/StarRating.tsx";

interface IdeaCardProps {
  idea: IdeaType;
  progressPercentage: number;
}

export const IdeaCard = ({ idea, progressPercentage }: IdeaCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipX, setTooltipX] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    setTooltipX(relativeX);
  };

  return (
    <div
      className="idea-card"
      style={{ border: idea.isClosed ? "1px solid red" : "1px solid #ccc" }}
      onClick={() => {
        window.location.href = `/ideas/details/${idea.ideaId}`;
      }}
    >
      <div className="idea-card__header">
        <h2 style={{ color: idea.isClosed ? "red" : "#ccc" }}>
          "{idea.ideaName}"
        </h2>
        {idea.creatorUsername && (
          <div
            className="idea-card__header-user"
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `/profile/${idea.creatorUsername}`;
            }}
          >
            <h3>{idea.creatorUsername}</h3>
            <UserProfileIcon username={idea.creatorUsername} />
          </div>
        )}
      </div>
      <p>{idea.ideaDescription}</p>
      <div>
        <p>INVESTING PROGRESS</p>
        <div
          className="idea-card__progress-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          <div
            className="idea-card__progress-bar"
            style={{ width: `${progressPercentage}%` }}
          />
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="idea-card__progress-tooltip"
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
        <div className="idea-card__footer">
          <p>TARGET SUM: {idea.targetAmount}$</p>
          <p>
            EXPIRATION DATE:{" "}
            {format(new Date(idea.fundingDeadline), "dd.MM.yyyy")}
          </p>
        </div>

        <StarRating rating={idea.averageRating} />
      </div>
    </div>
  );
};
