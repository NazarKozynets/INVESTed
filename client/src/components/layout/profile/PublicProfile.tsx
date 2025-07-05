import { Form } from "../../ui/form/Form.tsx";
import { UserProfileIcon } from "../../features/profile-icon/UserProfileIcon.tsx";
import { StarRating } from "../../ui/star-rating/StarRating.tsx";

interface PublicProfileProps {
  username: string;
  averageIdeaRating: number | null;
  totalIdeasAmount: number | null;
  totalFunding: number | null;
}

export const PublicProfile = ({
  username,
  averageIdeaRating,
  totalIdeasAmount,
  totalFunding,
}: PublicProfileProps) => {
  return (
    <Form className="public-profile-form">
      <div id="left-part">
        <UserProfileIcon username={username} size={200} />
        <p id="username">{username}</p>
      </div>
      <div id="right-part">
        {averageIdeaRating !== null && (
          <div id="user-rating">
            <p>Average Idea Rating:</p>
            <StarRating rating={averageIdeaRating} style={{ marginTop: 4 }} />
          </div>
        )}
        {totalIdeasAmount !== null && (
          <div id="user-rating">
            <p>Total Ideas: {totalIdeasAmount}</p>
          </div>
        )}
        {totalFunding !== null && (
          <div id="user-rating">
            <p>Total Funding: {totalFunding}$</p>
          </div>
        )}
        <div>
          <p>Last Ideas:</p>
        </div>
      </div>
    </Form>
  );
};
