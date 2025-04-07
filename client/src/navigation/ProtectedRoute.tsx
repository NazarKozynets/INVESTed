import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import { LoadingOverlay } from "../components/ui/loading-overlay/LoadingOverlay.tsx";
import { ReactNode } from "react";

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

    return children;
};