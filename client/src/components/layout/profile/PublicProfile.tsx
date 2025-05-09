import {Form} from "../../ui/form/Form.tsx";
import {UserProfileIcon} from "../../features/profile-icon/UserProfileIcon.tsx";

interface PublicProfileProps {
    username: string;
}

export const PublicProfile = ({username} : PublicProfileProps) => {
    return (
        <Form className="public-profile-form">
            <div id="left-part">
                <UserProfileIcon username={username} size={200}/>
                <p id="username">{username}</p>
            </div>
            <div id="right-part">
                <div id="user-rating">
                    <p>{username} Rating:</p>
                </div>
                <div>
                    <p>Last Ideas:</p>
                </div>
            </div>
        </Form>
    );
};