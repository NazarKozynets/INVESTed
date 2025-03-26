import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import {Background} from "./components/ui/background/Background.tsx";
import {routes} from "./navigation/routes.ts";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ToastContainer, Zoom} from "react-toastify";
import {AuthProvider, useAuth} from "./context/AuthContext.tsx";
import {ProtectedRoute} from "./navigation/ProtectedRoute.tsx";

const AdvancedToastContainer = () => {
    return <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Zoom}
    />;
}

export const App = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false
            }
        }
    })

    const NotFoundRedirect = () => {
        const { authState } = useAuth();
        return <Navigate to={authState?.token ? "/home" : "/"} replace />;
    };

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <Background>
                        <Routes>
                            {routes.map(({path, component: Component, isProtected}, index) => (
                                <Route
                                    key={index}
                                    path={path}
                                    element={
                                        isProtected ? (
                                            <ProtectedRoute>
                                                <Component />
                                            </ProtectedRoute>
                                        ) : (
                                            <Component />
                                        )
                                    }
                                />
                            ))}
                            <Route path="*" element={<NotFoundRedirect />} />
                        </Routes>
                    </Background>
                </Router>
                <AdvancedToastContainer/>
            </AuthProvider>
        </QueryClientProvider>
    );
};