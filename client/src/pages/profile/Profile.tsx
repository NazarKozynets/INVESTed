import { useEffect, useState } from "react";
import "../../styles/pages/_profilePage.scss";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getProfileData } from "../../services/api/profile/client-profile.api.ts";
import { LoadingOverlay } from "../../components/ui/loading-overlay/LoadingOverlay.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { UserProfileIcon } from "../../components/features/profile-icon/UserProfileIcon.tsx";
import { StarRating } from "../../components/ui/star-rating/StarRating.tsx";
import { Form } from "../../components/ui/form/Form.tsx";
import { AnimatePresence, motion } from "framer-motion";
import { AccountSettings } from "../../components/layout/profile/AccountSettings.tsx";
import { AccountForums } from "../../components/layout/profile/AccountForums.tsx";
import { AccountIdeas } from "../../components/layout/profile/AccountIdeas.tsx";

export const Profile = () => {
  const { checkSession } = useAuth();
  const { username: urlUsername } = useParams();

  const [selectedForm, setSelectedForm] = useState<number>(1);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile", urlUsername],
    queryFn: () => getProfileData(urlUsername || ""),
    enabled: !!urlUsername,
    retry: 1,
  });

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleFormChange = (formIndex: number) => {
    if (formIndex !== selectedForm) setSelectedForm(formIndex);
    else setSelectedForm(1);
  };

  const renderContent = () => {
    if (!profileData) return null;

    switch (selectedForm) {
      case 1:
        return <AccountIdeas userId={profileData.userId} />;
      case 2:
        return <AccountForums userId={profileData.userId} />;
      case 3:
        return <AccountSettings profileData={profileData} />;
      default:
        return null;
    }
  };

  if (isLoading) return <LoadingOverlay />;

  if (profileData && !isLoading) {
    return (
      <section className="section-profile">
        {profileData.isBanned && (
          <p className="section-profile__banned-title">
            ⛔ THIS USER IS BANNED ⛔
          </p>
        )}
        <Form
          className="public-profile-form"
          style={{
            border: profileData.isBanned ? "1px solid red" : "1px solid white",
          }}
        >
          <div id="left-part">
            <UserProfileIcon
              username={profileData.username}
              size={130}
              avatarUrl={profileData.avatarUrl}
            />
            <p id="username">{profileData.username}</p>
          </div>
          <div id="right-part">
            <div>
              {profileData.averageIdeaRating !== null && (
                <div id="user-rating">
                  <p>Average Idea Rating:</p>
                  <StarRating
                    rating={profileData.averageIdeaRating}
                    style={{ marginTop: 4 }}
                  />
                </div>
              )}
              <div id="user-rating">
                <p>Total Ideas: {profileData.totalIdeasAmount}</p>
              </div>
              <div id="user-rating">
                <p>Total Funding: {profileData.totalFunding}$</p>
              </div>
            </div>
            <div>
              <div id="user-rating">
                <p>Total Forums: {profileData.totalForumsAmount ?? 0}</p>
              </div>
              <div id="user-rating">
                <p>Closed Forums: {profileData.totalClosedForumsAmount ?? 0}</p>
              </div>
              <div id="user-rating">
                <p>Helpful answers: {profileData.helpfulAnswersAmount ?? 0}</p>
              </div>
            </div>
          </div>
        </Form>

        <div className="private-profile-section">
          <div id="top-buttons">
            <p
              className={`top-buttons-title ${selectedForm == 1 ? "current" : ""}`}
              onClick={() => handleFormChange(1)}
            >
              Ideas
            </p>
            <p
              className={`top-buttons-title ${selectedForm == 2 ? "current" : ""}`}
              onClick={() => handleFormChange(2)}
            >
              Forums
            </p>
            {profileData.canEdit && (
              <p
                className={`top-buttons-title ${selectedForm == 3 ? "current" : ""}`}
                onClick={() => handleFormChange(3)}
              >
                Settings
              </p>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedForm}
              className={`in-out-form-container ${selectedForm ? "visible" : ""}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    );
  }

  return null;
};
