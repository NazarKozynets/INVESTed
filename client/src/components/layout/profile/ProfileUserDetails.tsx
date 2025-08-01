import {Form} from "../../ui/form/Form.tsx";
import {UserProfileIcon} from "../../features/profile-icon/UserProfileIcon.tsx";
import {StarRating} from "../../ui/star-rating/StarRating.tsx";

interface PublicProfileProps {
    username: string;
    avatarUrl: string | null;
    averageIdeaRating: number | null;
    totalIdeasAmount: number | null;
    totalFunding: number | null;
    totalForumsAmount: number | null;
    closedForumsAmount: number | null;
    helpfulAnswersAmount: number | null;
}

export const PublicProfile = ({
                                  username,
                                  avatarUrl,
                                  averageIdeaRating,
                                  totalIdeasAmount,
                                  totalFunding,
                                  totalForumsAmount,
                                  closedForumsAmount,
                                  helpfulAnswersAmount,
                              }: PublicProfileProps) => {
    return (
        <Form className="public-profile-form">
            <div id="left-part">
                <UserProfileIcon username={username} size={130} avatarUrl={avatarUrl}/>
                <p id="username">{username}</p>
            </div>
            <div id="right-part">
                <div>
                    {averageIdeaRating !== null && (
                        <div id="user-rating">
                            <p>Average Idea Rating:</p>
                            <StarRating rating={averageIdeaRating} style={{marginTop: 4}}/>
                        </div>
                    )}
                    <div id="user-rating">
                        <p>Total Ideas: {totalIdeasAmount}</p>
                    </div>
                    <div id="user-rating">
                        <p>Total Funding: {totalFunding}$</p>
                    </div>
                </div>
                <div>
                    <div id="user-rating">
                        <p>Total Forums: {totalForumsAmount ?? 0}</p>
                    </div>
                    <div id="user-rating">
                        <p>Closed Forums: {closedForumsAmount ?? 0}</p>
                    </div>
                    <div id="user-rating">
                        <p>Helpful answers: {helpfulAnswersAmount ?? 0}</p>
                    </div>
                </div>
            </div>
        </Form>
    );
};
