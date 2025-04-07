import {PublicProfile} from "../../components/layout/profile/PublicProfile.tsx";
import {useAuth} from "../../context/AuthContext.tsx";
import {useEffect} from "react";

export const Profile = () => {
    const { authState } = useAuth();

    useEffect(() => {
        console.log(authState)
    }, [authState]);

    return (
        <section className="profile">
            <div>
                <PublicProfile />
            </div>

        </section>
    );
};