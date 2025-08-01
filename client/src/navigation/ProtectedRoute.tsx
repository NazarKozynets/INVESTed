import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { LoadingOverlay } from "../components/ui/loading-overlay/LoadingOverlay.tsx";
import { ReactNode } from "react";
import {routes} from "./routes.ts";
import {UserRole} from "../types/auth.types.ts";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { authState, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (!authState.isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const routeConfig = routes.find((route) => route.path === location.pathname);
  const allowedRoles = routeConfig?.allowedRoles;

  if (allowedRoles && !allowedRoles.includes(authState.userData?.role as UserRole))
    return <Navigate to={"/"} replace/>

  return children;
};
