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
                return "bg-emerald-600 border-emerald-700";
            case "error":
                return "bg-red-600 border-red-700";
            case "warning":
                return "bg-amber-500 border-amber-600";
            case "info":
            default:
                return "bg-blue-600 border-blue-700";
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
            <div className="fixed bottom-4 left-1/2 z-[100] flex min-w-[280px] -translate-x-1/2 flex-col gap-2 px-4 sm:px-0">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`${getTypeStyles(
                            message.type
                        )} flex items-center gap-3 rounded-lg border px-4 py-3 text-white shadow-sm animate-slide-up`}
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
                    animation: slide-up 0.2s ease-out;
                }
            `}</style>
        </SnackbarContext.Provider>
    );
};
