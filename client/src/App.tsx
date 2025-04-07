import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import {Background} from "./components/ui/background/Background.tsx";
import {routes} from "./navigation/routes.ts";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ToastContainer, Zoom} from "react-toastify";
import {AuthProvider} from "./context/AuthContext.tsx";
import {ProtectedRoute} from "./navigation/ProtectedRoute.tsx";
import {Header} from "./components/features/header/Header.tsx";

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

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <Routes>
                        {routes.map(({ path, component: Component, isProtected }, index) => (
                            <Route
                                key={index}
                                path={path}
                                element={
                                    isProtected ? (
                                        <ProtectedRoute>
                                            <Header />
                                            <Component />
                                        </ProtectedRoute>
                                    ) : (
                                        <Component />
                                    )
                                }
                            />
                        ))}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    <Background />
                </Router>
                <AdvancedToastContainer />
            </AuthProvider>
        </QueryClientProvider>
    );
};