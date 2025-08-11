import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../context/AuthContext.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GetProfileResponseData,
  UpdateProfileFieldsRequestData,
} from "../../../types/profile.types.ts";
import {
  banUser,
  updateProfileFields,
} from "../../../services/api/profile/client-profile.api.ts";
import { uploadImageFile } from "../../../services/api/cloudinary/cloudinary.api.ts";
import { CloudinaryFolderType } from "../../../types/cloudinary.types.ts";
import { toast } from "react-toastify";
import {
  validateEmail,
  validatePassword,
} from "../../../utils/functions/validations.ts";
import { Form } from "../../ui/form/Form.tsx";
import { LoadingBar } from "../../ui/loading-bar/LoadingBar.tsx";
import ImageUploader from "../../ui/image-uploader/ImageUploader.tsx";
import { TextInput } from "../../ui/text-input/TextInput.tsx";
import { LoadingOverlay } from "../../ui/loading-overlay/LoadingOverlay.tsx";
import Button from "../../ui/button/Button.tsx";
import banIcon from "../../../assets/ban-user.png";
import userRole from "../../../assets/user-role.svg";

interface AccountSettingsProps {
  profileData: GetProfileResponseData;
}

export const AccountSettings = ({ profileData }: AccountSettingsProps) => {
  const queryClient = useQueryClient();
  const { authState, checkSession } = useAuth();

  const currentUserRole = authState.userData?.role;
  const currentUserId = authState.userData?.userId;

  const [selectedImage, setSelectedImage] = useState<string | null>(
    profileData.avatarUrl ?? null,
  );
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const submitButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (newPassword && submitButtonRef.current) {
      const element = submitButtonRef.current;
      const rect = element.getBoundingClientRect();

      if (rect.bottom > window.innerHeight) {
        element.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [newPassword]);

  const {
    mutate: mutateUpdateProfileFields,
    isPending: isUpdatingProfileFields,
  } = useMutation({
    mutationFn: (data: UpdateProfileFieldsRequestData) => {
      if (
        currentUserRole === "Moderator" &&
        currentUserId !== profileData.userId
      )
        return Promise.reject(new Error("MODER_OTHER_ACC"));
      return updateProfileFields(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", profileData.username],
      });

      checkSession().then(() => {
        if (newUsername && newUsername !== profileData.username) {
          window.location.href = `/profile/${newUsername}`;
        }
      });

      setNewUsername("");
      setNewEmail("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      if (err.message === "MODER_OTHER_ACC")
        toast.error("Moderators can only update their accounts");
      console.error(err);
    },
  });

  const banUserMutation = useMutation({
    mutationFn: (userId: string) => {
      if (!userId?.trim()) return Promise.reject(new Error("INVALID_ID"));
      if (currentUserRole === "Client")
        return Promise.reject(new Error("NOT_ENOUGH_ACCESS"));
      return banUser(userId.trim());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["profile", profileData.username],
      });
      toast.success(
        data === true
          ? `User ${profileData.username} was banned`
          : `You unban user ${profileData.username}`,
      );
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleImageChange = async (file: File | null) => {
    if (currentUserRole === "Moderator" && currentUserId !== profileData.userId)
      return toast.error("Moderators can only update their accounts");

    if (!file) {
      setSelectedImage(null);
      return;
    }

    try {
      setIsUploadingImage(true);
      const response = await uploadImageFile({
        folderType: CloudinaryFolderType.Avatars,
        file: file,
      });
      setSelectedImage(response);
    } catch (error: any) {
      console.error(
        "Error uploading image:",
        error.response?.data || error.message,
      );
      setSelectedImage(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.dismiss();

    if (newUsername && !newUsername.trim()) {
      toast.error("Username is required", { toastId: "username-error" });
      return;
    }

    if (newEmail && !validateEmail(newEmail)) {
      toast.error("Please enter a valid email address", {
        toastId: "email-error",
      });
      return;
    }

    if (newPassword && !validatePassword(newPassword)) {
      toast.error(
        "Password must be: 8+ characters, 1 letter, 1 number, 1 special character",
        { toastId: "password-error" },
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        toastId: "confirm-password-error",
      });
      return;
    }

    mutateUpdateProfileFields({
      id: profileData.userId,
      username: newUsername.trim(),
      email: newEmail.trim(),
      avatarUrl: selectedImage!,
    });
  };

  const canShowAdminSettings = useMemo(() => {
    switch (currentUserRole) {
      case "Client":
        return false;
      case "Moderator":
        return currentUserId !== profileData.userId;
      case "Admin":
        return currentUserId !== profileData.userId;
      default:
        return false;
    }
  }, [currentUserRole, currentUserId, profileData.userId]);

  return (
    <>
      {canShowAdminSettings && (
        <div className="account-admin-settings">
          <div
            id="element"
            onClick={() => banUserMutation.mutate(profileData.userId)}
            style={{
              border: profileData.isBanned
                ? "2px solid white"
                : "2px solid red",
            }}
          >
            <img src={banIcon} alt="ban" />
            <p>{profileData.isBanned ? "Unban user" : "Ban user"}</p>
          </div>
          <div id="element">
            <p>Update user role</p>
            <img src={userRole} alt="user-role" />
          </div>
        </div>
      )}
      {profileData.canEdit && (
        <Form className="account-settings-form">
          <div id="element">
            {!isUpdatingProfileFields ? (
              <>
                <p>Change profile picture:</p>
                <div className="account-settings-form__image-import">
                  {isUploadingImage ? (
                    <LoadingBar />
                  ) : (
                    <ImageUploader
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      imageUrl={selectedImage}
                      onImageChange={handleImageChange}
                      previewClassName="account-settings-form__image-preview"
                    />
                  )}
                </div>
                <p>Username: {profileData.username}</p>
                <TextInput
                  className="account-settings-input"
                  name={"username"}
                  placeholder={"Input new username"}
                  value={newUsername}
                  setValue={setNewUsername}
                  type={"text"}
                />
                <p>Email: {profileData.email}</p>
                <TextInput
                  className="account-settings-input"
                  name={"email"}
                  placeholder={"Input new email"}
                  value={newEmail}
                  setValue={setNewEmail}
                  type={"email"}
                />
                {currentUserId === profileData.userId && (
                  <>
                    <p>Password:</p>
                    <TextInput
                      className="account-settings-input"
                      name="password"
                      placeholder="Password"
                      value={newPassword}
                      setValue={setNewPassword}
                      id="input"
                      type="password"
                    />
                  </>
                )}
                {newPassword && (
                  <>
                    <p>Confirm Password:</p>
                    <TextInput
                      name="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      setValue={setConfirmPassword}
                      id="input"
                      type="password"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSubmit(e);
                        }
                      }}
                    />
                  </>
                )}
              </>
            ) : (
              <LoadingOverlay />
            )}
          </div>

          <div
            className={`in-out-form-container ${newUsername || newEmail || newPassword || selectedImage !== profileData.avatarUrl ? "visible" : ""}`}
            style={{
              margin:
                newUsername ||
                newEmail ||
                newPassword ||
                selectedImage !== profileData.avatarUrl
                  ? "20px auto 0"
                  : "0 auto",
              width: "30%",
            }}
            ref={submitButtonRef}
          >
            <Button
              text="Update profile"
              onClick={(e) => handleSubmit(e)}
              className="update-account-settings-btn"
            />
          </div>
        </Form>
      )}
    </>
  );
};
