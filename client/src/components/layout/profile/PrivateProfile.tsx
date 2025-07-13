import { Form } from "../../ui/form/Form.tsx";
import { useEffect, useRef, useState } from "react";
import { TextInput } from "../../ui/text-input/TextInput.tsx";
import { useAuth } from "../../../context/AuthContext.tsx";
import Button from "../../ui/button/Button.tsx";
import { updateProfileFields } from "../../../services/api/profile/client-profile.api.ts";
import { UpdateProfileFieldsRequestData } from "../../../types/profile.types.ts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  validateEmail,
  validatePassword,
} from "../../../utils/functions/validations.ts";
import { LoadingOverlay } from "../../ui/loading-overlay/LoadingOverlay.tsx";
import { getAllClientIdeas } from "../../../services/api/idea/get-ideas.api.ts";
import { IdeaType } from "../../../types/idea.types.ts";
import { Idea } from "../../features/ideas/Idea.tsx";
import { AnimatePresence, motion } from "framer-motion";

const AccountOwnIdeas = () => {
  const { authState } = useAuth();

  const id = authState?.userData?.userId;

  const { data, isLoading, isError } = useQuery<Array<IdeaType>>({
    queryKey: ["clientIdeas", id],
    queryFn: () => getAllClientIdeas(id || ""),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    console.log(data);
  }, [data]);

  if (isLoading) {
    return (
      <Form>
        <LoadingOverlay />
      </Form>
    );
  }

  if (isError || !data) {
    return (
      <Form className="account-own-ideas-form">
        <div>
          <p>Failed to load ideas. Please try again later.</p>
        </div>
      </Form>
    );
  }

  return (
    <Form
      className="account-own-ideas-form"
      style={{ width: data.length === 0 ? "50%" : "60%" }}
    >
      <h2 id="header">My Ideas</h2>
      <div id="ideas">
        {data.length > 0 ? (
          data.map((idea: IdeaType, index) => <Idea key={index} idea={idea} />)
        ) : (
          <p>You have no ideas yet.</p>
        )}
      </div>
    </Form>
  );
};

const AccountSettingsForm = () => {
  const queryClient = useQueryClient();
  const { authState, checkSession } = useAuth();

  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      id: authState.userData?.userId!,
      username: newUsername.trim(),
      email: newEmail.trim(),
    });
  };

  return (
    <Form className="account-settings-form">
      <div id="element">
        {!isUpdatingProfileFields ? (
          <>
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
          <LoadingOverlay />
        )}
      </div>

      <div
        className={`in-out-form-container ${newUsername || newEmail || newPassword ? "visible" : ""}`}
        style={{
          margin:
            newUsername || newEmail || newPassword ? "20px auto 0" : "0 auto",
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

export const PrivateProfile = () => {
  const [selectedForm, setSelectedForm] = useState<number>(1);

  const handleFormChange = (formIndex: number) => {
    if (formIndex !== selectedForm) setSelectedForm(formIndex);
    else setSelectedForm(1);
  };

  return (
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
        <p
          className={`top-buttons-title ${selectedForm == 3 ? "current" : ""}`}
          onClick={() => handleFormChange(3)}
        >
          Settings
        </p>
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
          {selectedForm === 1 ? (
            <AccountOwnIdeas />
          ) : selectedForm === 2 ? (
            <p>Forums</p>
          ) : (
            <AccountSettingsForm />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
