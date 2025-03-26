import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.tsx";
import {ReactNode} from "react";

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const { authState } = useAuth();

    if (!authState?.token) {
        return <Navigate to="/" replace />;
    }

    return children;
};