import {useEffect, useState} from "react";
import {Form} from "../ui/form/Form.tsx";
import {motion, AnimatePresence} from "framer-motion";
import {TextInput} from "../ui/textInput/TextInput.tsx";
import Button from "../ui/button/Button.tsx";
import googleIcon from "../../assets/devicon_google.svg";
import githubIcon from "../../assets/bi_github.svg";
import facebookIcon from "../../assets/logos_facebook.svg";
import {useAuth} from "../../context/AuthContext.tsx";
import {toast} from "react-toastify";

const contentForInfoForm = [
    {
        title: 'Welcome to Our Platform',
        subTitle: `"Turn your ideas into reality!"`,
        desc: 'Join a community of innovators, backers, and creators. Start your journey today!'
    },
    {
        title: 'Create & Fund Projects',
        subTitle: `"Launch your dream project!"`,
        desc: 'Set a goal, describe your idea, and gather supporters to bring it to life.'
    },
    {
        title: 'Engage with the Community',
        subTitle: `"Connect, collaborate, and grow!"`,
        desc: 'Join discussions, participate in groups, and share insights with like-minded individuals.'
    },
    {
        title: 'Stay Secure & Informed',
        subTitle: `"Transparency and security at every step!"`,
        desc: 'Moderation, analytics, and trusted payments ensure a safe experience for all.'
    }
];

interface AuthFormProps {
    emailInput: string;
    setEmailInput: (input: string) => void;
    setIsSignup: (input: boolean) => void;
}

const LoginForm = ({ emailInput, setEmailInput, setIsSignup }: AuthFormProps) => {
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
          const response = await onLogin({
              email: emailInput,
              password: passwordInput,
          })

          console.log(response, 'login response')

          toast.success('Congratulations! You successfully logged in!');
      } catch (error) {
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

const SignupForm = ({emailInput, setEmailInput, setIsSignup}: AuthFormProps) => {
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
            const response = await onRegister({
                username: usernameInput,
                email: emailInput,
                password: passwordInput,
                userRole: "client"
            });

            console.log(response, 'signup response');
            toast.success('Congratulations! Now you can use our platform')
        } catch (error) {
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

export const AuthPage = () => {
    const [currentInfoFormContent, setCurrentInfoFormContent] = useState(0)
    const [isSignup, setIsSignup] = useState(false)
    const [emailInput, setEmailInput] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentInfoFormContent((prev) => (prev + 1) % contentForInfoForm.length);
        }, 7000);

        return () => clearInterval(interval);
    }, [contentForInfoForm.length]);

    return (
        <section className='auth-page'>
            <Form className='info-form'>
                <AnimatePresence mode='wait'>
                    <motion.div className='info-form-content'
                        key={currentInfoFormContent}
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        exit={{opacity: 0, x: 20}}
                        transition={{duration: 0.5, ease: "backInOut"}}
                    >
                        <p id='title'>{contentForInfoForm[currentInfoFormContent].title}</p>
                        <p id='subtitle'>{contentForInfoForm[currentInfoFormContent].subTitle}</p>
                        <p id='desc'>{contentForInfoForm[currentInfoFormContent].desc}</p>
                    </motion.div>
                </AnimatePresence>
            </Form>
            <Form className='auth-form'>
                {isSignup ?
                    <SignupForm emailInput={emailInput} setEmailInput={setEmailInput} setIsSignup={setIsSignup}/> :
                        <LoginForm emailInput={emailInput} setEmailInput={setEmailInput} setIsSignup={setIsSignup}/>}
            </Form>
        </section>
    )
}