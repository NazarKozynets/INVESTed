import { ComponentType } from "react";
import {UserRole} from "../types/auth.types.ts";

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
  CreateForum: undefined;
  ForumsAll: undefined;
  ForumDetails: undefined;
};

export interface IRoute {
  name: keyof TypeRootStackParamList;
  path: string;
  component: ComponentType;
  isProtected: boolean;
  allowedRoles?: UserRole[];
}
