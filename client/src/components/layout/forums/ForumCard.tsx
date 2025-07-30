import { ForumType } from "../../../types/forum.types.ts";
import { UserProfileIcon } from "../../features/profile-icon/UserProfileIcon.tsx";
import "./forum-card.scss";
import { formatDate } from "../../../utils/functions/formatters.ts";
import { useState } from "react";

interface ForumCardProps {
  forum: ForumType;
}

export const ForumCard = ({ forum }: ForumCardProps) => {
  const [showImage, setShowImage] = useState(false);

  const handleShowImageChange = () => {
    setShowImage(!showImage);
  };

  return (
    <div
      className="forum-card"
      style={{ border: forum.isClosed ? "1px solid red" : "1px solid #ccc" }}
      onClick={() => {
        window.location.href = `/forums/details/${forum.forumId}`;
      }}
    >
      <div className="forum-card__header">
        <div>
          {forum.creatorUsername && (
            <div
              className="forum-card__header-user"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/profile/${forum.creatorUsername}`;
              }}
            >
              <UserProfileIcon username={forum?.creatorUsername} avatarUrl={forum?.creatorAvatarUrl} />
              <h3>{forum.creatorUsername}</h3>
            </div>
          )}
          {forum.isClosed && <div style={{ color: "red" }}>Closed</div>}
        </div>
      </div>
      <h2 className="forum-card__title">{forum.forumTitle}</h2>
      <p className="forum-card__desc">{forum.forumDescription}</p>
      {forum.imageUrl ? (
        showImage ? (
          <div
            className="forum-card__image"
            onClick={(e) => {
              e.stopPropagation();
              handleShowImageChange();
            }}
          >
            <img src={forum.imageUrl} alt="" />
          </div>
        ) : (
          <div className="forum-card__show-img-btn">
            <p
              onClick={(e) => {
                e.stopPropagation();
                handleShowImageChange();
              }}
            >
              Show image
            </p>
          </div>
        )
      ) : null}
      <div className="forum-card__footer">
        <p className="forum-card__footer-comments-amount">
          {forum.comments.length ?? 0} answers
        </p>
        {forum.createdAt && (
          <p className="forum-card__footer-date">
            {formatDate(forum.createdAt)}
          </p>
        )}
      </div>
    </div>
  );
};
