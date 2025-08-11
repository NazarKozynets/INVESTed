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
      style={{ border: forum.isClosed ? "2px solid red" : "1px solid #ccc" }}
      onClick={() => {
        window.open(`/forums/details/${forum.forumId}`, "_blank");
      }}
    >
      <div className="forum-card__header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {forum.creatorUsername && (
            <div
              className="forum-card__header-user"
              style={{ color: forum.isOwnerBanned ? "red" : "white" }}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/profile/${forum.creatorUsername}`;
              }}
            >
              <UserProfileIcon
                username={forum?.creatorUsername}
                avatarUrl={forum?.creatorAvatarUrl}
                isOwnerBanned={forum.isOwnerBanned}
              />
              <h3>{forum.creatorUsername}</h3>
            </div>
          )}
          {forum.isClosed && (
            <div style={{ color: "red", fontSize: 18, fontWeight: 600 }}>
              Closed
            </div>
          )}
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
