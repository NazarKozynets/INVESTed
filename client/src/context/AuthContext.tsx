import { createContext, ReactNode, useCallback, useContext, useState, useEffect } from "react";
import { checkAuth, loginUser, logoutUser, registerUser } from "../services/auth/auth.api.ts";
import { AuthRequestData, AuthResponseData, UserData } from "../types/auth.types.ts";

interface AuthContextProps {
    authState: {
        userData: UserData | null;
        isAuthenticated: boolean;
    };
    isLoading: boolean;
    onRegister: (data: AuthRequestData) => Promise<AuthResponseData>;
    onLogin: (data: AuthRequestData) => Promise<AuthResponseData>;
    onLogout: () => Promise<void>;
    checkSession: () => Promise<void>;
}

interface AuthState {
    userData: UserData | null;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextProps>({
    authState: {
        userData: null,
        isAuthenticated: false
    },
    isLoading: false,
    onRegister: async () => { throw new Error("Not implemented"); },
    onLogin: async () => { throw new Error("Not implemented"); },
    onLogout: async () => { throw new Error("Not implemented"); },
    checkSession: async () => { throw new Error("Not implemented"); }
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authState, setAuthState] = useState<AuthState>({
        userData: null,
        isAuthenticated: false
    });
    const [isLoading, setIsLoading] = useState(true);

    const isTokenValid = (expiryDate: string | undefined): boolean => {
        if (!expiryDate) return false;

        try {
            const normalizedDate = expiryDate.endsWith('Z') ? expiryDate : expiryDate + 'Z';
            const expiry = new Date(normalizedDate);

            return expiry.getTime() > Date.now();
        } catch (e) {
            console.error("Invalid date format:", expiryDate, e);
            return false;
        }
    };

    const updateAuthState = (userData: UserData | null) => {
        const isAuthenticated = Boolean(userData && isTokenValid(userData.expiresIn));
        setAuthState({ userData, isAuthenticated });

        if (userData) {
            sessionStorage.setItem('userData', JSON.stringify(userData));
        } else {
            sessionStorage.removeItem('userData');
        }
    };

    useEffect(() => {
        const verifySession = async () => {
            setIsLoading(true);
            try {
                const { userData } = await checkAuth();
                updateAuthState(userData && isTokenValid(userData.expiresIn) ? userData : null);
            } catch (error) {
                updateAuthState(null);
                console.error("Session verification failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        verifySession();
    }, []);

    const onRegister = useCallback(async (data: AuthRequestData) => {
        try {
            setIsLoading(true);
            const response = await registerUser(data);
            updateAuthState(response.userData || null);
            return response;
        } catch (error) {
            updateAuthState(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const onLogin = useCallback(async (data: AuthRequestData) => {
        try {
            setIsLoading(true);
            const response = await loginUser(data);
            if (!response?.userData || !isTokenValid(response.userData.expiresIn)) {
                throw new Error("Authentication failed");
            }
            updateAuthState(response.userData);
            return response;
        } catch (error) {
            updateAuthState(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const onLogout = useCallback(async () => {
        try {
            setIsLoading(true);
            await logoutUser();
            updateAuthState(null);
        } catch (error) {
            console.error("Logout failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const checkSession = useCallback(async () => {
        try {
            const { userData } = await checkAuth();
            updateAuthState(userData && isTokenValid(userData.expiresIn) ? userData : null);
        } catch {
            updateAuthState(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{
            authState,
            isLoading,
            onRegister,
            onLogin,
            onLogout,
            checkSession
        }}>
            {children}
        </AuthContext.Provider>
    );
};