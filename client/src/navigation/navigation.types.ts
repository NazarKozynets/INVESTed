import { ComponentType } from "react";

export type TypeRootStackParamList = {
  Auth: undefined;
  ResetPassword: undefined;
  Home: undefined;
  About: undefined;
  Profile: { userId: string };
  StartIdea: undefined;
  IdeaDetails: undefined;
  IdeasAll: undefined;
  Payment: undefined;
};

export interface IRoute {
  name: keyof TypeRootStackParamList;
  path: string;
  component: ComponentType;
  isProtected: boolean;
}
