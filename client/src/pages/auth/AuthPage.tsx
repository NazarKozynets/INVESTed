import { useEffect, useState } from "react";
import { Form } from "../../components/ui/form/Form.tsx";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "../../components/layout/auth-page/LoginForm.tsx";
import { SignupForm } from "../../components/layout/auth-page/SignupForm.tsx";
import { useAuth } from "../../context/AuthContext.tsx";
import { useLocation, useNavigate } from "react-router-dom";

export const contentForInfoForm = [
  {
    title: "Welcome to Our Platform",
    subTitle: `"Turn your ideas into reality!"`,
    desc: "Join a community of innovators, backers, and creators. Start your journey today!",
    extra: [
      "Explore groundbreaking ideas.",
      "Get inspired by real success stories.",
      "Build your public profile and connect.",
    ],
  },
  {
    title: "Create & Fund Projects",
    subTitle: `"Launch your dream project!"`,
    desc: "Set a goal, describe your idea, and gather supporters to bring it to life.",
    extra: [
      "Flexible funding options.",
      "Multimedia support for your project page.",
      "Track funding progress in real time.",
    ],
  },
  {
    title: "Engage with the Community",
    subTitle: `"Connect, collaborate, and grow!"`,
    desc: "Join discussions, participate in groups, and share insights with like-minded individuals.",
    extra: [
      "Join topic-specific groups.",
      "Comment, like, and follow projects.",
      "Earn reputation by helping others.",
    ],
  },
  {
    title: "Stay Secure & Informed",
    subTitle: `"Transparency and security at every step!"`,
    desc: "Moderation, analytics, and trusted payments ensure a safe experience for all.",
    extra: [
      "Built-in fraud prevention.",
      "User reports and moderation tools.",
      "Detailed analytics for every project.",
    ],
  },
];

export const AuthPage = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentInfoFormContent, setCurrentInfoFormContent] = useState(1);
  const [isSignup, setIsSignup] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  useEffect(() => {
    if (authState.isAuthenticated) {
      const from =
        (location.state as { from?: { pathname: string } })?.from?.pathname ||
        "/home";
      navigate(from, { replace: true });
    }
  }, [authState.isAuthenticated, navigate, location]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInfoFormContent(
        (prev) => (prev + 1) % contentForInfoForm.length,
      );
    }, 7000);

    return () => clearInterval(interval);
  }, [contentForInfoForm.length]);

  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  return (
    <section className="auth-page">
      <Form className="info-form">
        <AnimatePresence mode="wait">
          <motion.div
            className="info-form-content"
            key={currentInfoFormContent}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: "backInOut" }}
          >
            <p id="title">{contentForInfoForm[currentInfoFormContent].title}</p>
            <p id="subtitle">
              {contentForInfoForm[currentInfoFormContent].subTitle}
            </p>
            <p id="desc">{contentForInfoForm[currentInfoFormContent].desc}</p>
            <motion.ul
              id="info-extra"
              variants={listVariants}
              initial="hidden"
              animate="visible"
            >
              {contentForInfoForm[currentInfoFormContent].extra?.map(
                (item, index) => (
                  <motion.li key={index} variants={itemVariants}>
                    {item}
                  </motion.li>
                ),
              )}
            </motion.ul>
          </motion.div>
        </AnimatePresence>
      </Form>
      <Form className="auth-form">
        {isSignup ? (
          <SignupForm
            emailInput={emailInput}
            setEmailInput={setEmailInput}
            setIsSignup={setIsSignup}
          />
        ) : (
          <LoginForm
            emailInput={emailInput}
            setEmailInput={setEmailInput}
            setIsSignup={setIsSignup}
          />
        )}
      </Form>
    </section>
  );
};
