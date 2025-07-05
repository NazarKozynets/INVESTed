import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import React, { useState } from "react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  className?: string;
  style?: React.CSSProperties;
  onRatingChange?: (newRating: number) => void;
  interactive?: boolean;
}

export const StarRating = ({
  rating,
  maxStars = 5,
  className,
  style,
  onRatingChange,
  interactive = false,
}: StarRatingProps) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const handleClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoveredRating(index + 1);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredRating(null);
    }
  };

  return (
    <div className={className || "star-rating"} style={style}>
      {[...Array(maxStars)].map((_, index) => {
        const isFullStar =
          index < fullStars ||
          (hoveredRating !== null && index < hoveredRating);
        const isHalfStar =
          !isFullStar &&
          index === fullStars &&
          hasHalfStar &&
          hoveredRating === null;

        return (
          <span
            key={index}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            style={{
              cursor: interactive ? "pointer" : "default",
              display: "inline-block",
            }}
          >
            {isFullStar ? (
              <FaStar color="#ffc107" />
            ) : isHalfStar ? (
              <FaStarHalfAlt color="#ffc107" />
            ) : (
              <FaRegStar color="#ccc" />
            )}
          </span>
        );
      })}
    </div>
  );
};
