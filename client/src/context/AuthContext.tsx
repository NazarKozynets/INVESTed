import {createContext, ReactNode, useCallback, useContext, useState} from "react";
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
    const [authState, setAuthState] = useState<AuthState>(() => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        return {
            token: token || null,
            userData: userData ? JSON.parse(userData) : null
        };
    });

    const onRegister = useCallback(async (data: AuthRequestData) => {
        try {
            const response = await registerUser(data);
            if (response.token && response.userData) {
                const newAuthState = {
                    token: response.token,
                    userData: response.userData
                };
                setAuthState(newAuthState);
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('userData', JSON.stringify(response.userData));
            } else {
                throw new Error("Unable to register");
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
                const newAuthState = {
                    token: response.token,
                    userData: response.userData
                };
                setAuthState(newAuthState);
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('userData', JSON.stringify(response.userData));
            } else {
                throw new Error("Login failed");
            }

            return response;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    }, []);

    const onLogout = useCallback(() => {
        setAuthState({ token: null, userData: null });
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
    }, []);

    return (
        <AuthContext.Provider value={{ authState, onRegister, onLogin, onLogout }}>
            {children}
        </AuthContext.Provider>
    );
}