import { ForumType } from "../../../types/forum.types.ts";
import { UserProfileIcon } from "../../features/profile-icon/UserProfileIcon.tsx";
import "./forum-card.scss";
import { formatDate } from "../../../utils/functions/formatters.ts";

interface ForumCardProps {
  forum: ForumType;
}

export const ForumCard = ({ forum }: ForumCardProps) => {
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
              <UserProfileIcon username={forum?.creatorUsername} />
              <h3>{forum.creatorUsername}</h3>
            </div>
          )}
          {forum.isClosed && <div style={{ color: "red" }}>Closed</div>}
        </div>
      </div>
      <h2 className="forum-card__title">{forum.forumTitle}</h2>
      <p className="forum-card__desc">{forum.forumDescription}</p>
      <div className="forum-card__footer">
        <p className="forum-card__footer-comments-amount">
          {forum.comments.length ?? 0} replies
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
