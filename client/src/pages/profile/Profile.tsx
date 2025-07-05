import { PublicProfile } from "../../components/layout/profile/PublicProfile.tsx";
import { useEffect } from "react";
import "../../styles/pages/_profilePage.scss";
import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "react-router-dom";
import { getProfileData } from "../../services/profile/client-profile.api.ts";
import { LoadingOverlay } from "../../components/ui/loading-overlay/LoadingOverlay.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { PrivateProfile } from "../../components/layout/profile/PrivateProfile.tsx";

export const Profile = () => {
  const { authState, checkSession } = useAuth();
  const { username: urlUsername } = useParams();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", urlUsername],
    queryFn: () => getProfileData(urlUsername || ""),
    enabled: !!urlUsername,
    retry: 1,
  });

  useEffect(() => {
    checkSession();
  }, []);

  if (isLoading) return <LoadingOverlay />;

  if (!urlUsername && authState.userData?.username) {
    return <Navigate to={`/profile/${authState.userData.username}`} replace />;
  }
  if (profileData && !isLoading) {
    return (
      <section className="section-profile">
        <PublicProfile
          username={profileData.username}
          averageIdeaRating={profileData.averageIdeaRating}
          totalIdeasAmount={profileData.totalIdeasAmount}
          totalFunding={profileData.totalFunding}
        />
        {profileData.canEdit && <PrivateProfile />}
      </section>
    );
  }

  return null;
};
