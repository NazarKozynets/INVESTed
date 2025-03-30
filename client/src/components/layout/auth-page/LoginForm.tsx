import {useAuth} from "../../../context/AuthContext.tsx";
import {useState} from "react";
import {TextInput} from "../../ui/text-input/TextInput.tsx";
import Button from "../../ui/button/Button.tsx";
import googleIcon from "../../../assets/devicon_google.svg";
import githubIcon from "../../../assets/bi_github.svg";
import facebookIcon from "../../../assets/logos_facebook.svg";
import {AuthFormProps} from "../../../types/auth.types.ts";
import {toast} from "react-toastify";

export const LoginForm = ({ emailInput, setEmailInput, setIsSignup }: AuthFormProps) => {
    const { onLogin } = useAuth();

    const [passwordInput, setPasswordInput] = useState("");
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    const handleForgotPassword = () => {
        setIsForgotPassword(true);
    };

    const handleBackToLogin = () => {
        setIsForgotPassword(false);
        setIsSignup(true);
    };

    const handleLogin = async () => {
        if (!onLogin) return;

        try {
            const result =  await onLogin({
                email: emailInput,
                password: passwordInput,
            })

            if (result && result.token) {
                toast.success('Congratulations! You successfully logged in!');
            } else {
                throw new Error("token is empty");
            }
        } catch (error) {
            toast.error("Login failed");
            console.error("Login Failed", error);
        }
    };

    return isForgotPassword ? (
        <div className="auth-form-content">
            <div id="title-block">
                <p id="title">Forgot Password?</p>
                <p id="subtitle">Please enter your email</p>
            </div>
            <div id="inputs-block">
                <TextInput
                    name="email"
                    placeholder="example@gmail.com"
                    value={emailInput}
                    setValue={setEmailInput}
                    type="text"
                />
            </div>
            <div id="buttons-block">
                <Button
                    text="Reset Password"
                    className="reset-password-btn"
                    onClick={handleLogin}
                />
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
                <p onClick={handleBackToLogin}>
                    Don't have an account? Signup
                </p>
            </div>
        </div>
    ) : (
        <div className="auth-form-content">
            <div id="title-block">
                <p id="title">Login</p>
                <p id="subtitle">Glad you're back!</p>
            </div>
            <div id="inputs-block">
                <TextInput
                    name="email"
                    placeholder="example@gmail.com"
                    value={emailInput}
                    setValue={setEmailInput}
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
            </div>
            <div id="buttons-block">
                <Button text="Login" onClick={handleLogin} />
                <p
                    id="forgot-pass-btn"
                    onClick={handleForgotPassword}
                >
                    Forgot password? Click here
                </p>
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
                <p onClick={() => setIsSignup(true)}>Don't have an account? Signup</p>
            </div>
        </div>
    );
}