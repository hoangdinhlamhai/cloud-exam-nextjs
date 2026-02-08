"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SnackbarMessage {
    id: string;
    text: string;
    type: "success" | "error" | "warning" | "info";
    duration: number;
}

interface SnackbarContextType {
    openSnackbar: (options: {
        text: string;
        type?: "success" | "error" | "warning" | "info";
        duration?: number;
    }) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error("useSnackbar must be used within a SnackbarProvider");
    }
    return context;
};

interface SnackbarProviderProps {
    children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
    const [messages, setMessages] = useState<SnackbarMessage[]>([]);

    const openSnackbar = useCallback(
        ({
            text,
            type = "info",
            duration = 3000,
        }: {
            text: string;
            type?: "success" | "error" | "warning" | "info";
            duration?: number;
        }) => {
            const id = Math.random().toString(36).substring(7);
            const message: SnackbarMessage = { id, text, type, duration };

            setMessages((prev) => [...prev, message]);

            setTimeout(() => {
                setMessages((prev) => prev.filter((m) => m.id !== id));
            }, duration);
        },
        []
    );

    const getTypeStyles = (type: SnackbarMessage["type"]) => {
        switch (type) {
            case "success":
                return "bg-green-500/90 border-green-400";
            case "error":
                return "bg-red-500/90 border-red-400";
            case "warning":
                return "bg-yellow-500/90 border-yellow-400";
            case "info":
            default:
                return "bg-blue-500/90 border-blue-400";
        }
    };

    const getIcon = (type: SnackbarMessage["type"]) => {
        switch (type) {
            case "success":
                return "✓";
            case "error":
                return "✕";
            case "warning":
                return "⚠";
            case "info":
            default:
                return "ℹ";
        }
    };

    return (
        <SnackbarContext.Provider value={{ openSnackbar }}>
            {children}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${getTypeStyles(
                            message.type
                        )} text-white px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm flex items-center gap-3 animate-slide-up min-w-[280px]`}
                    >
                        <span className="text-lg">{getIcon(message.type)}</span>
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                ))}
            </div>
            <style jsx>{`
                @keyframes slide-up {
                    from {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .animate-slide-up {
                    animation: slide-up 0.3s ease-out;
                }
            `}</style>
        </SnackbarContext.Provider>
    );
};
