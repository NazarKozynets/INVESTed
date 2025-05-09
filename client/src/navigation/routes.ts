import {IRoute} from "./navigation.types.ts";
import {AuthPage} from "../pages/auth/AuthPage.tsx";
import {HomePage} from "../pages/home/HomePage.tsx";
import {AboutUsPage} from "../pages/about/AboutUsPage.tsx";
import {Profile} from "../pages/profile/Profile.tsx";
import {StartIdea} from "../pages/start-idea/StartIdea.tsx";

export const routes: IRoute[] = [
    {
        name: 'Auth',
        path: '/',
        component: AuthPage,
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
    }
]