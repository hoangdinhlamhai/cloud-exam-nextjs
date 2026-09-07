"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "light",
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("light");

    const applyTheme = (nextTheme: Theme) => {
        const root = document.documentElement;
        root.setAttribute("data-theme", nextTheme);
        root.classList.remove("dark", "light");
        root.classList.add(nextTheme);
    };

    // Load saved theme and apply it after hydration. The server-rendered default is light.
    useEffect(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        const initial = saved || "light";
        setTheme(initial);
        applyTheme(initial);
    }, []);

    const toggleTheme = () => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        localStorage.setItem("theme", next);
        applyTheme(next);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
