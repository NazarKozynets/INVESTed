import {ComponentType} from "react";

export type TypeRootStackParamList = {
    Auth: undefined
    Home: undefined
    About: undefined
    Profile: { userId: string }
}

export interface IRoute {
    name: keyof TypeRootStackParamList;
    path: string;
    component: ComponentType;
    isProtected: boolean;
}