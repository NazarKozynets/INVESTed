import React, {useEffect, useRef, useState} from "react";
import {useAuth} from "../../../context/AuthContext.tsx";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {UpdateProfileFieldsRequestData} from "../../../types/profile.types.ts";
import {updateProfileFields} from "../../../services/api/profile/client-profile.api.ts";
import {uploadImageFile} from "../../../services/api/cloudinary/cloudinary.api.ts";
import {CloudinaryFolderType} from "../../../types/cloudinary.types.ts";
import {toast} from "react-toastify";
import {validateEmail, validatePassword} from "../../../utils/functions/validations.ts";
import {Form} from "../../ui/form/Form.tsx";
import {LoadingBar} from "../../ui/loading-bar/LoadingBar.tsx";
import ImageUploader from "../../ui/image-uploader/ImageUploader.tsx";
import {TextInput} from "../../ui/text-input/TextInput.tsx";
import {LoadingOverlay} from "../../ui/loading-overlay/LoadingOverlay.tsx";
import Button from "../../ui/button/Button.tsx";

export const AccountSettingsForm = () => {
    const queryClient = useQueryClient();
    const {authState, checkSession} = useAuth();

    const [selectedImage, setSelectedImage] = useState<string | null>(
        authState?.userData?.avatarUrl ?? null,
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
                element.scrollIntoView({behavior: "smooth", block: "end"});
            }
        }
    }, [newPassword]);

    const {
        mutate: mutateUpdateProfileFields,
        isPending: isUpdatingProfileFields,
    } = useMutation({
        mutationFn: (data: UpdateProfileFieldsRequestData) =>
            updateProfileFields(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["profile", authState.userData?.username],
            });

            checkSession().then(() => {
                if (newUsername && newUsername !== authState.userData?.username) {
                    window.location.href = `/profile/${newUsername}`;
                }
            });

            setNewUsername("");
            setNewEmail("");
            setNewPassword("");
            setConfirmPassword("");
        },
    });

    const handleImageChange = async (file: File | null) => {
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
            toast.error("Username is required", {toastId: "username-error"});
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
                {toastId: "password-error"},
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
            id: authState.userData?.userId!,
            username: newUsername.trim(),
            email: newEmail.trim(),
            avatarUrl: selectedImage!,
        });
    };

    return (
        <Form className="account-settings-form">
            <div id="element">
                {!isUpdatingProfileFields ? (
                    <>
                        <p>Change profile picture:</p>
                        <div className="account-settings-form__image-import">
                            {isUploadingImage ? (
                                <LoadingBar/>
                            ) : (
                                <ImageUploader
                                    style={{width: "100%"}}
                                    imageUrl={selectedImage}
                                    onImageChange={handleImageChange}
                                    previewClassName="account-settings-form__image-preview"
                                />
                            )}
                        </div>
                        <p>Username: {authState.userData?.username}</p>
                        <TextInput
                            className="account-settings-input"
                            name={"username"}
                            placeholder={"Input new username"}
                            value={newUsername}
                            setValue={setNewUsername}
                            type={"text"}
                        />
                        <p>Email: {authState.userData?.email}</p>
                        <TextInput
                            className="account-settings-input"
                            name={"email"}
                            placeholder={"Input new email"}
                            value={newEmail}
                            setValue={setNewEmail}
                            type={"email"}
                        />
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
                    <LoadingOverlay/>
                )}
            </div>

            <div
                className={`in-out-form-container ${newUsername || newEmail || newPassword || selectedImage !== authState?.userData?.avatarUrl ? "visible" : ""}`}
                style={{
                    margin:
                        newUsername || newEmail || newPassword || selectedImage !== authState?.userData?.avatarUrl ? "20px auto 0" : "0 auto",
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
    );
};
