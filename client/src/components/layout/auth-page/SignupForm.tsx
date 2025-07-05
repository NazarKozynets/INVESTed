import { useAuth } from "../../../context/AuthContext.tsx";
import { useState } from "react";
import { toast } from "react-toastify";
import { TextInput } from "../../ui/text-input/TextInput.tsx";
import Button from "../../ui/button/Button.tsx";
import googleIcon from "../../../assets/devicon_google.svg";
import githubIcon from "../../../assets/bi_github.svg";
import facebookIcon from "../../../assets/logos_facebook.svg";
import { AuthFormProps } from "../../../types/auth.types.ts";
import {
  validateEmail,
  validatePassword,
} from "../../../utils/functions/validations.ts";
import { useNavigate } from "react-router-dom";

export const SignupForm = ({
  emailInput,
  setEmailInput,
  setIsSignup,
}: AuthFormProps) => {
  const { onRegister } = useAuth();

  const navigate = useNavigate();

  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = async () => {
    if (!onRegister) return;

    toast.dismiss();

    if (!usernameInput.trim()) {
      toast.error("Username is required", { toastId: "username-error" });
      return;
    }

    if (!validateEmail(emailInput)) {
      toast.error("Please enter a valid email address", {
        toastId: "email-error",
      });
      return;
    }

    if (!validatePassword(passwordInput)) {
      toast.error(
        "Password must be: 8+ characters, 1 letter, 1 number, 1 special character",
        { toastId: "password-error" },
      );
      return;
    }

    if (passwordInput !== confirmPassword) {
      toast.error("Passwords do not match", {
        toastId: "confirm-password-error",
      });
      return;
    }

    try {
      const result = await onRegister({
        username: usernameInput.trim(),
        email: emailInput.trim().toLowerCase(),
        password: passwordInput.trim(),
      });

      if (result?.userData) {
        toast.success("Registration successful! Welcome!", {
          autoClose: 3000,
          toastId: "signup-success",
        });
        navigate("/home");
      }
    } catch (error) {
      let errorMessage = "Registration failed";

      if (error instanceof Error) {
        if (error.message.startsWith("username:")) {
          errorMessage = error.message.replace("username: ", "");
        } else if (error.message.startsWith("email:")) {
          errorMessage = error.message.replace("email: ", "");
        } else if (error.message.startsWith("password:")) {
          errorMessage = error.message.replace("password: ", "");
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, {
        autoClose: 5000,
        toastId: "signup-error",
      });

      console.error("Signup error:", error);
    }
  };

  return (
    <div className="auth-form-content">
      <div id="title-block">
        <p id="title">Signup</p>
        <p id="subtitle">Just some details to get you in!</p>
      </div>
      <div id="inputs-block">
        <TextInput
          name="username"
          placeholder="Username"
          value={usernameInput}
          setValue={setUsernameInput}
          type="text"
        />
        <TextInput
          name="email"
          placeholder="example@gmail.com"
          value={emailInput}
          setValue={setEmailInput}
          id="input"
          type="text"
        />
        <TextInput
          name="password"
          placeholder="Password"
          value={passwordInput}
          setValue={setPasswordInput}
          id="input"
          type="password"
        />
        <TextInput
          name="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          setValue={setConfirmPassword}
          id="confirm-password-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSignup();
            }
          }}
          type="password"
        />
      </div>
      <div id="buttons-block">
        <Button text="Signup" onClick={handleSignup} />
      </div>
      <div id="another-auth-ways">
        <div id="line-block">
          <div id="line"></div>
          <span id="or-text">Or</span>
          <div id="line"></div>
        </div>
        <div id="icons-block">
          <img src={googleIcon} alt="Google" />
          <img src={githubIcon} alt="GitHub" />
          <img src={facebookIcon} alt="Facebook" />
        </div>
      </div>
      <div id="change-auth-form-type">
        <p onClick={() => setIsSignup(false)}>Already Registered? Login</p>
      </div>
    </div>
  );
};
