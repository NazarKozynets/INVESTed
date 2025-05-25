import {IRoute} from "./navigation.types.ts";
import {AuthPage} from "../pages/auth/AuthPage.tsx";
import {HomePage} from "../pages/home/HomePage.tsx";
import {AboutUsPage} from "../pages/about/AboutUsPage.tsx";
import {Profile} from "../pages/profile/Profile.tsx";
import {StartIdea} from "../pages/start-idea/StartIdea.tsx";
import {IdeaDetails} from "../pages/idea-details/IdeaDetails.tsx";
import {IdeasAll} from "../components/features/ideas/IdeasAll.tsx";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage.tsx";
import {PaymentPage} from "../pages/idea-details/PaymentPage.tsx";

export const routes: IRoute[] = [
    {
        name: 'Auth',
        path: '/',
        component: AuthPage,
        isProtected: false
    },
    {
        name: "ResetPassword",
        path: '/reset-password',
        component: ResetPasswordPage,
        isProtected: false
    },
    {
        name: 'Home',
        path: '/home',
        component: HomePage,
        isProtected: true
    },
    {
        name: 'About',
        path: '/about',
        component: AboutUsPage,
        isProtected: true
    },
    {
        name: 'Profile',
        path: '/profile/:username',
        component: Profile,
        isProtected: true
    },
    {
        name: 'StartIdea',
        path: '/ideas/start',
        component: StartIdea,
        isProtected: true
    },
    {
        name: "IdeaDetails",
        path: '/ideas/details/:ideaId',
        component: IdeaDetails,
        isProtected: true
    },
    {
        name: "IdeasAll",
        path: "ideas/all",
        component: IdeasAll,
        isProtected: true
    },
    {
        name: "Payment",
        path: "/ideas/details/payment/:ideaId",
        component: PaymentPage,
        isProtected: true
    }
]