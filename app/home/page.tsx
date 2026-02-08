"use client";

import React from "react";
import { useRouter } from "next/navigation";

// Menu Data
const menuItems = [
    {
        key: "certs",
        icon: "★",
        label: "Chứng chỉ",
        desc: "Lộ trình AWS, Azure...",
        color: "from-orange-400 to-amber-500",
        shadow: "shadow-orange-500/20",
        route: "/certs",
    },
    {
        key: "courses",
        icon: "🎬",
        label: "Khoá học",
        desc: "Luyện tập không giới hạn",
        color: "from-blue-400 to-indigo-500",
        shadow: "shadow-blue-500/20",
        route: "/courses",
    },
    {
        key: "exams",
        icon: "📝",
        label: "Đề thi",
        desc: "Luyện thi thử",
        color: "from-cyan-400 to-teal-500",
        shadow: "shadow-cyan-500/20",
        route: "/exams",
    },
    {
        key: "history",
        icon: "⏰",
        label: "Lịch sử",
        desc: "Kết quả luyện tập",
        color: "from-purple-400 to-pink-500",
        shadow: "shadow-purple-500/20",
        route: "/history",
    },
    {
        key: "notes",
        icon: "📒",
        label: "Ghi chú",
        desc: "Sổ tay kiến thức",
        color: "from-emerald-400 to-green-500",
        shadow: "shadow-emerald-500/20",
        route: "/notes",
    },
] as const;

// Fake User Data
const user = {
    name: "Minh Nguyen",
    level: "Pro Member",
    avatar: "M",
};

const HomePage = () => {
    const router = useRouter();

    return (
        <div className="bg-slate-900 flex flex-col min-h-screen relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-40 -left-20 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header Section */}
            <header className="sticky top-0 z-50 px-4 py-2 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 p-0.5 shadow-lg shadow-cyan-500/20">
                        <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center p-0.5">
                            <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{user.avatar}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-medium">Welcome back,</p>
                        <h2 className="text-white text-base font-bold">{user.name}</h2>
                    </div>
                </div>
                <button
                    className="w-9 h-9 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors relative"
                    onClick={() => console.log("Open Notifications")}
                >
                    <span className="text-cyan-400">🔔</span>
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-slate-900"></div>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 overflow-y-auto pb-20">

                {/* Quick Stats or Promo Banner */}
                <div className="mb-8 relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xl shadow-indigo-500/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <p className="text-white/80 text-xs font-medium mb-1 uppercase tracking-wider">Daily Challenge</p>
                    <h3 className="text-white text-xl font-bold mb-2">AWS Solutions Architect</h3>
                    <p className="text-white/90 text-sm mb-4 max-w-[80%]">10 new questions added today. Keep your streak alive!</p>
                    <button
                        className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-100 transition-colors"
                        onClick={() => router.push('/exams')}
                    >
                        Practice Now
                    </button>
                </div>

                {/* Menu Grid */}
                <h2 className="text-white text-lg font-bold mb-4 px-2">Explore</h2>
                <div className="grid grid-cols-2 gap-3">
                    {menuItems.map((item, idx) => (
                        <div
                            key={idx}
                            className={`bg-slate-800/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-3 group active:scale-95 transition-all duration-200 cursor-pointer ${idx === 0 ? 'col-span-2 flex-row items-center' : ''}`}
                            onClick={() => router.push(item.route)}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} ${item.shadow} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform text-xl`}>
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-base">{item.label}</h3>
                                <p className="text-slate-400 text-xs">{item.desc}</p>
                            </div>
                            {idx === 0 && (
                                <div className="ml-auto w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <span className="text-white text-sm">›</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Recent Activity Section */}
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4 px-2">
                        <h2 className="text-white text-lg font-bold">Recent Activity</h2>
                        <button className="text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors">See All</button>
                    </div>

                    <div className="space-y-3">
                        {[1, 2].map((_, i) => (
                            <div key={i} className="flex items-center gap-3 bg-slate-800/30 p-3 rounded-xl border border-white/5">
                                <div className="w-2 h-10 rounded-full bg-cyan-500/20"></div>
                                <div className="flex-1">
                                    <h4 className="text-white font-medium text-sm">AZ-900 Fundamentals</h4>
                                    <p className="text-slate-500 text-xs">Score: 85% • 2 hours ago</p>
                                </div>
                                <div className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold">
                                    PASS
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default HomePage;
