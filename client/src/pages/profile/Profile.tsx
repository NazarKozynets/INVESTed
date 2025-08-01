import {ProfileUserDetails} from "../../components/layout/profile/ProfileUserDetails.tsx";
import {useEffect} from "react";
import "../../styles/pages/_profilePage.scss";
import {useQuery} from "@tanstack/react-query";
import {Navigate, useParams} from "react-router-dom";
import {getProfileData} from "../../services/api/profile/client-profile.api.ts";
import {LoadingOverlay} from "../../components/ui/loading-overlay/LoadingOverlay.tsx";
import {useAuth} from "../../context/AuthContext.tsx";
import {ProfileUserProjects} from "../../components/layout/profile/ProfileUserProjects.tsx";

export const Profile = () => {
    const {authState, checkSession} = useAuth();
    const {username: urlUsername} = useParams();

    const {data: profileData, isLoading} = useQuery({
        queryKey: ["profile", urlUsername],
        queryFn: () => getProfileData(urlUsername || ""),
        enabled: !!urlUsername,
        retry: 1,
    });

    useEffect(() => {
        checkSession();
    }, []);

    if (isLoading) return <LoadingOverlay/>;

    if (!urlUsername && authState.userData?.username) {
        return <Navigate to={`/profile/${authState.userData.username}`} replace/>;
    }
    if (profileData && !isLoading) {
        return (
            <section className="section-profile">
                <ProfileUserDetails
                    username={profileData.username}
                    avatarUrl={profileData.avatarUrl}
                    averageIdeaRating={profileData.averageIdeaRating}
                    totalIdeasAmount={profileData.totalIdeasAmount}
                    totalFunding={profileData.totalFunding}
                    totalForumsAmount={profileData.totalForumsAmount}
                    closedForumsAmount={profileData.totalClosedForumsAmount}
                    helpfulAnswersAmount={profileData.helpfulAnswersAmount}
                />
                <ProfileUserProjects userId={profileData.userId} canEdit={profileData.canEdit}/>
            </section>
        );
    }

    return null;
};
