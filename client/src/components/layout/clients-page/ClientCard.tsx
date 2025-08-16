import "./client-card.scss";
import {GetProfileResponseData} from "../../../types/profile.types.ts";
import {UserProfileIcon} from "../../features/profile-icon/UserProfileIcon.tsx";
import {userRoleMapReverse} from "../../../types/auth.types.ts";

interface ClientCardProps {
    client: GetProfileResponseData;
}

export const ClientCard = ({client}: ClientCardProps) => {
    return (
        <div
            className="client-card"
            style={{border: client.isBanned ? "2px solid red" : "1px solid #ccc"}}
            onClick={(e) => {
                e.preventDefault();
                window.location.href = `/profile/${client.username}`;
            }}>

            <UserProfileIcon
                username={client.username}
                avatarUrl={client.avatarUrl}
                isOwnerBanned={client.isBanned}
                size={100}
            />
            <div className="client-card__content">
                <h3>{client.username}</h3>
                <p>{userRoleMapReverse[client.userRole]}</p>
            </div>
        </div>
    );
};