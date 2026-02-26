"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Certification roadmap data
const certifications = [
    {
        provider: "AWS",
        logo: "🔶",
        color: "from-orange-400 to-amber-500",
        borderColor: "border-orange-500/30",
        bgColor: "bg-orange-500/10",
        paths: [
            {
                level: "Foundational",
                name: "Cloud Practitioner",
                code: "CLF-C02",
                duration: "90 min",
                questions: "65",
                passingScore: "700/1000",
                status: "available", // available, locked, completed
            },
            {
                level: "Associate",
                name: "Solutions Architect",
                code: "SAA-C03",
                duration: "130 min",
                questions: "65",
                passingScore: "720/1000",
                status: "available",
            },
            {
                level: "Associate",
                name: "Developer",
                code: "DVA-C02",
                duration: "130 min",
                questions: "65",
                passingScore: "720/1000",
                status: "available",
            },
            {
                level: "Professional",
                name: "Solutions Architect Pro",
                code: "SAP-C02",
                duration: "180 min",
                questions: "75",
                passingScore: "750/1000",
                status: "locked",
            },
        ],
    },
    {
        provider: "Azure",
        logo: "🔷",
        color: "from-blue-400 to-cyan-500",
        borderColor: "border-blue-500/30",
        bgColor: "bg-blue-500/10",
        paths: [
            {
                level: "Fundamentals",
                name: "Azure Fundamentals",
                code: "AZ-900",
                duration: "85 min",
                questions: "40-60",
                passingScore: "700/1000",
                status: "available",
            },
            {
                level: "Associate",
                name: "Administrator",
                code: "AZ-104",
                duration: "150 min",
                questions: "40-60",
                passingScore: "700/1000",
                status: "available",
            },
            {
                level: "Associate",
                name: "Developer",
                code: "AZ-204",
                duration: "150 min",
                questions: "40-60",
                passingScore: "700/1000",
                status: "available",
            },
            {
                level: "Expert",
                name: "Solutions Architect",
                code: "AZ-305",
                duration: "120 min",
                questions: "40-60",
                passingScore: "700/1000",
                status: "locked",
            },
        ],
    },
    {
        provider: "Google Cloud",
        logo: "🔴",
        color: "from-red-400 to-yellow-500",
        borderColor: "border-red-500/30",
        bgColor: "bg-red-500/10",
        paths: [
            {
                level: "Foundational",
                name: "Cloud Digital Leader",
                code: "CDL",
                duration: "90 min",
                questions: "50-60",
                passingScore: "70%",
                status: "available",
            },
            {
                level: "Associate",
                name: "Cloud Engineer",
                code: "ACE",
                duration: "120 min",
                questions: "50-60",
                passingScore: "70%",
                status: "available",
            },
            {
                level: "Professional",
                name: "Cloud Architect",
                code: "PCA",
                duration: "120 min",
                questions: "50-60",
                passingScore: "70%",
                status: "locked",
            },
            {
                level: "Professional",
                name: "Data Engineer",
                code: "PDE",
                duration: "120 min",
                questions: "50-60",
                passingScore: "70%",
                status: "locked",
            },
        ],
    },
];

// Level badge colors
const levelColors: Record<string, string> = {
    Practitioner: "bg-green-500/20 text-green-400 border-green-500/30",
    Foundational: "bg-green-500/20 text-green-400 border-green-500/30",
    Fundamentals: "bg-green-500/20 text-green-400 border-green-500/30",
    Associate: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Professional: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Expert: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const CertsPage = () => {
    const router = useRouter();
    const [expandedProvider, setExpandedProvider] = useState<string | null>("AWS");

    const handleCertClick = (provider: string, certCode: string, status: string) => {
        if (status === "locked") return;
        // Navigate to exams filtered by this certification
        router.push(`/exams?certCode=${certCode}`);
    };

    return (
        <div className="bg-slate-900 flex flex-col min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <header className="sticky top-0 z-50 px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button
                        className="w-9 h-9 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => router.back()}
                    >
                        <span className="text-white">←</span>
                    </button>
                    <div>
                        <h1 className="text-white text-lg font-bold">Lộ trình chứng chỉ</h1>
                        <p className="text-slate-400 text-xs">Chọn chứng chỉ để bắt đầu luyện tập</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-4 overflow-y-auto pb-20">
                <div className="space-y-4">
                    {certifications.map((provider) => (
                        <div
                            key={provider.provider}
                            className={`${provider.bgColor} border ${provider.borderColor} rounded-2xl overflow-hidden`}
                        >
                            {/* Provider Header */}
                            <button
                                onClick={() => setExpandedProvider(
                                    expandedProvider === provider.provider ? null : provider.provider
                                )}
                                className={`w-full bg-gradient-to-r ${provider.color} p-4 flex items-center justify-between`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{provider.logo}</span>
                                    <div className="text-left">
                                        <h2 className="text-white font-bold text-lg">{provider.provider}</h2>
                                        <p className="text-white/80 text-xs">
                                            {provider.paths.length} chứng chỉ
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-white text-xl transition-transform ${expandedProvider === provider.provider ? "rotate-180" : ""}`}>
                                    ▼
                                </span>
                            </button>

                            {/* Certification Paths */}
                            {expandedProvider === provider.provider && (
                                <div className="p-3 space-y-2">
                                    {provider.paths.map((cert, idx) => (
                                        <div
                                            key={cert.code}
                                            onClick={() => handleCertClick(provider.provider, cert.code, cert.status)}
                                            className={`bg-slate-800/50 border border-white/5 rounded-xl p-4 ${cert.status === "locked" ? "opacity-50" : "cursor-pointer hover:bg-slate-800/70"} transition-all relative`}
                                        >
                                            {/* Connection line (except first) */}
                                            {idx > 0 && (
                                                <div className="absolute -top-4 left-8 w-0.5 h-4 bg-slate-600"></div>
                                            )}

                                            <div className="flex items-start gap-3">
                                                {/* Step number */}
                                                <div className={`w-8 h-8 rounded-full ${cert.status === "completed" ? "bg-green-500" : cert.status === "locked" ? "bg-slate-600" : `bg-gradient-to-r ${provider.color}`} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                                    {cert.status === "completed" ? (
                                                        <span className="text-white text-sm">✓</span>
                                                    ) : cert.status === "locked" ? (
                                                        <span className="text-slate-400 text-sm">🔒</span>
                                                    ) : (
                                                        <span className="text-white text-sm font-bold">{idx + 1}</span>
                                                    )}
                                                </div>

                                                {/* Cert Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${levelColors[cert.level] || "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}>
                                                            {cert.level}
                                                        </span>
                                                        <span className="text-slate-400 text-xs">{cert.code}</span>
                                                    </div>
                                                    <h3 className="text-white font-bold text-sm">{cert.name}</h3>
                                                    <div className="flex items-center gap-3 mt-2 text-slate-500 text-xs">
                                                        <span>🕐 {cert.duration}</span>
                                                        <span>📋 {cert.questions} câu</span>
                                                        <span>✓ {cert.passingScore}</span>
                                                    </div>
                                                </div>

                                                {/* Arrow/Lock */}
                                                <div className="flex items-center">
                                                    {cert.status === "locked" ? (
                                                        <span className="text-slate-500">🔒</span>
                                                    ) : (
                                                        <span className="text-slate-400">›</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h3 className="text-white font-bold text-sm mb-1">Mẹo luyện thi</h3>
                            <p className="text-slate-300 text-xs leading-relaxed">
                                Bắt đầu từ chứng chỉ Foundational để xây dựng nền tảng vững chắc.
                                Sau đó tiến lên Associate và Professional theo lộ trình được đề xuất.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CertsPage;
