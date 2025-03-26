import {IRoute} from "./navigation.types.ts";
import {AuthPage} from "../components/layout/AuthPage.tsx";
import {HomePage} from "../components/layout/HomePage.tsx";

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
    }
]