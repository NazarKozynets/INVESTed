import {useAuth} from "../../../context/AuthContext.tsx";
import {useState} from "react";
import {toast} from "react-toastify";
import {TextInput} from "../../ui/text-input/TextInput.tsx";
import Button from "../../ui/button/Button.tsx";
import googleIcon from "../../../assets/devicon_google.svg";
import githubIcon from "../../../assets/bi_github.svg";
import facebookIcon from "../../../assets/logos_facebook.svg";
import {AuthFormProps} from "../../../types/auth.types.ts";

export const SignupForm = ({emailInput, setEmailInput, setIsSignup}: AuthFormProps) => {
    const { onRegister } = useAuth();

    const [usernameInput, setUsernameInput] = useState("");
    const [passwordInput, setPasswordInput] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSignup = async () => {
        if (!onRegister) return;

        if (passwordInput !== confirmPassword) {
            toast.warn("Passwords do not match!");
            return;
        }

        try {
            const result = await onRegister({
                username: usernameInput,
                email: emailInput,
                password: passwordInput,
                userRole: "client"
            });

            if (result && result.token) {
                toast.success('Congratulations! Now you can use our platform')
            } else {
                throw new Error("token is empty");
            }
        } catch (error) {
            toast.error("Something went wrong!");
            console.error("Signup failed", error);
        }
    };

    return (
        <div className="auth-form-content">
            <div id='title-block'>
                <p id='title'>Signup</p>
                <p id='subtitle'>Just some details to get you in!</p>
            </div>
            <div id='inputs-block'>
                <TextInput name='username'
                           placeholder='Username'
                           value={usernameInput}
                           setValue={setUsernameInput}
                           type='text'/>
                <TextInput name='email'
                           placeholder='example@gmail.com'
                           value={emailInput}
                           setValue={setEmailInput}
                           id='input'
                           type='text'/>
                <TextInput name='password'
                           placeholder='Password'
                           value={passwordInput}
                           setValue={setPasswordInput}
                           id='input'
                           type='password'/>
                <TextInput name='password'
                           placeholder='Confirm Password'
                           value={confirmPassword}
                           setValue={setConfirmPassword}
                           id='confirm-password-input'
                           type='password'/>
            </div>
            <div id='buttons-block'>
                <Button
                    text="Signup"
                    onClick={handleSignup}
                />
            </div>
            <div id='another-auth-ways'>
                <div id='line-block'>
                    <div id="line"></div>
                    <span id="or-text">Or</span>
                    <div id="line"></div>
                </div>
                <div id='icons-block'>
                    <img src={googleIcon} alt="Google"/>
                    <img src={githubIcon} alt="GitHub"/>
                    <img src={facebookIcon} alt="Facebook"/>
                </div>
            </div>
            <div id='change-auth-form-type'>
                <p onClick={() => setIsSignup(false)}>Already Registered? Login</p>
            </div>
        </div>
    )
}
