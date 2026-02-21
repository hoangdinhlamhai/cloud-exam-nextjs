"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

const Header = () => {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <header
            className="w-full sticky top-0 z-50 px-4 py-3 flex justify-between items-center backdrop-blur-xl transition-colors duration-300"
            style={{
                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                borderBottom: `1px solid var(--border-clr)`,
            }}
        >
            {/* Sign In button */}
            <button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full px-5 py-2 font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-opacity"
                style={{ color: '#ffffff' }}
            >
                Sign In
            </button>

            <div className="flex items-center gap-3">
                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
                    style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    }}
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    <span
                        className={`absolute transition-all duration-300 ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-50"}`}
                    >
                        🌙
                    </span>
                    <span
                        className={`absolute transition-all duration-300 ${!isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"}`}
                    >
                        ☀️
                    </span>
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-md opacity-50"></div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
                            Cloud<span className="text-cyan-400">Exam</span>
                        </span>
                        <span className="text-cyan-300 text-xs font-medium">
                            Master the Cloud
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
