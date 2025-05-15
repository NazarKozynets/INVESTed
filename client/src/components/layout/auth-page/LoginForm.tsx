import {useAuth} from "../../../context/AuthContext.tsx";
import {useState} from "react";
import {TextInput} from "../../ui/text-input/TextInput.tsx";
import Button from "../../ui/button/Button.tsx";
import googleIcon from "../../../assets/devicon_google.svg";
import githubIcon from "../../../assets/bi_github.svg";
import facebookIcon from "../../../assets/logos_facebook.svg";
import {AuthFormProps} from "../../../types/auth.types.ts";
import {toast} from "react-toastify";
import {useNavigate} from "react-router-dom";
import {requestPasswordReset} from "../../../services/auth/auth.api.ts";

export const LoginForm = ({emailInput, setEmailInput, setIsSignup}: AuthFormProps) => {
    const {onLogin} = useAuth();

    const navigate = useNavigate();

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
            const result = await onLogin({
                email: emailInput.trim().toLowerCase(),
                password: passwordInput.trim(),
            });

            if (result.userData) {
                toast.success('Login successful! Redirecting...');
                navigate("/home");
            }
        } catch (error) {
            setPasswordInput("");
        }
    };

    const handleForgotPasswordReset = async () => {
        const res = await requestPasswordReset(emailInput.trim().toLowerCase());

        if (res) {
            toast.success('Password reset link sent to email');
            setIsForgotPassword(false);
        } else {
            toast.error("Something went wrong");
        } 
    }

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
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleForgotPasswordReset();
                        }
                    }}
                />
            </div>
            <div id="buttons-block">
                <Button
                    text="Reset Password"
                    className="reset-password-btn"
                    onClick={handleForgotPasswordReset}
                />
            </div>
            <div id="another-auth-ways">
                <div id="line-block">
                    <div id="line"></div>
                    <span id="or-text">Or</span>
                    <div id="line"></div>
                </div>
                <div id="icons-block">
                    <img src={googleIcon} alt="Google"/>
                    <img src={githubIcon} alt="GitHub"/>
                    <img src={facebookIcon} alt="Facebook"/>
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
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleLogin();
                        }
                    }}
                />
            </div>
            <div id="buttons-block">
                <Button text="Login" onClick={handleLogin}/>
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
                    <img src={googleIcon} alt="Google"/>
                    <img src={githubIcon} alt="GitHub"/>
                    <img src={facebookIcon} alt="Facebook"/>
                </div>
            </div>
            <div id="change-auth-form-type">
                <p onClick={() => setIsSignup(true)}>Don't have an account? Signup</p>
            </div>
        </div>
    );
}