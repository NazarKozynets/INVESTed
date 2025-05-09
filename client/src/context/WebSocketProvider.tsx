import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface WebSocketContextType {
    socket: WebSocket | null;
    sendMessage: (message: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const connect = () => {
        const ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_API_URL);
        ws.onopen = () => {
            console.log("WebSocket connected");
        };
        ws.onclose = () => {
            console.log("WebSocket disconnected, trying to reconnect...");
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
            ws.close();
        };

        setSocket(ws);
    };

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            socket?.close();
        };
    }, []);

    const sendMessage = (message: string) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        } else {
            console.warn("WebSocket is not open. Message not sent:", message);
        }
    };

    return (
        <WebSocketContext.Provider value={{ socket, sendMessage }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};
