"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: "dark",
    toggleTheme: () => { },
});

export function useTheme() {
    return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");

    // Load saved theme + apply class on mount
    useEffect(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        const initial = saved || "dark";
        setTheme(initial);
        applyTheme(initial);
    }, []);

    const applyTheme = (t: Theme) => {
        const root = document.documentElement;
        root.setAttribute("data-theme", t);
        root.classList.remove("dark", "light");
        root.classList.add(t);
    };

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
