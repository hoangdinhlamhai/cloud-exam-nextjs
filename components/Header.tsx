"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

const Header = () => {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <header className="site-header sticky top-0 z-50 w-full">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                    <span className="brand-mark flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">C</span>
                    <div className="flex flex-col leading-tight">
                        <span className="wordmark text-lg font-bold tracking-tight">
                            Cloud<span className="wordmark-accent">Exam</span>
                        </span>
                        <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Master the Cloud</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="theme-button flex h-9 w-9 items-center justify-center rounded-lg text-base"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? "☀" : "☾"}
                    </button>
                    <button
                        onClick={() => router.push('/login')}
                        className="primary-action rounded-lg px-4 py-2 text-sm font-semibold"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
