"use client";

import { useRouter } from "next/navigation";

const Header = () => {
    const router = useRouter();

    return (
        <header className="w-full bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 sticky top-0 z-50 px-4 py-3 flex justify-between items-center border-b border-white/10">
            <button
                onClick={() => router.push('/login')}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full px-5 py-2 font-semibold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-opacity"
            >
                Sign In
            </button>
            <div className="flex items-center gap-3 flex-row-reverse text-right">
                {/* Logo with glow effect */}
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-400 rounded-xl blur-md opacity-50"></div>
                    <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-black text-xl">C</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-white font-bold text-lg leading-tight">
                        CloudExam
                    </span>
                    <span className="text-cyan-300 text-xs font-medium">
                        Master the Cloud
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Header;
