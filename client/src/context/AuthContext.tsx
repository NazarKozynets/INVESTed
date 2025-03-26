import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {loginUser, registerUser} from "../services/auth/auth.api.ts";
import {AuthRequestData, AuthResponseData} from "../types/auth.types.ts";

interface AuthContextProps {
    authState?: { token: string | null; userData: any | null};
    onRegister?: ( data: AuthRequestData ) => Promise<AuthResponseData>;
    onLogin?: ( data: AuthRequestData ) => Promise<AuthResponseData>;
    onLogout?: () => void;
}

interface AuthState {
    token: string | null;
    userData: any | null;
}

const AuthContext = createContext<AuthContextProps>({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authState, setAuthState] = useState<AuthState>({
        token: null,
        userData: null
    })

    useEffect(() => {
        if (authState.token) {
            localStorage.setItem("token", authState.token);
            localStorage.setItem("userData", JSON.stringify(authState.userData));
        } else {
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
        }
    }, [authState]);

    const onRegister = useCallback(async (data: AuthRequestData) => {
        try {
            const response = await registerUser(data);
            if (response.token && response.userData) {
                setAuthState({ token: response.token, userData: response.userData });
            }
            return response;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    }, []);

    const onLogin = useCallback(async (data: AuthRequestData) => {
        try {
            const response = await loginUser(data);

            if (response.token && response.userData) {
                setAuthState({ token: response.token, userData: response.userData });
            }
            return response;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    }, []);

    const onLogout = () => {
        console.log(authState.token);
    };

    return <AuthContext.Provider value={{ authState, onRegister, onLogin, onLogout }}>{children}</AuthContext.Provider>;
}