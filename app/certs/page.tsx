"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Certification roadmap data
const certifications = [
    {
        provider: "AWS",
        logo: "🔶",
        color: "bg-blue-600",
        borderColor: "border-slate-200",
        bgColor: "bg-white",
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
        color: "bg-blue-600",
        borderColor: "border-slate-200",
        bgColor: "bg-white",
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
        color: "bg-blue-600",
        borderColor: "border-slate-200",
        bgColor: "bg-white",
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
    Practitioner: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    Foundational: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    Fundamentals: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    Associate: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
    Professional: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300",
    Expert: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-900/60 dark:bg-pink-950/40 dark:text-pink-300",
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
        <div className="app-shell flex min-h-screen flex-col">
            {/* Header */}
            <header className="site-header sticky top-0 z-50 px-4 py-3">
                <div className="mx-auto flex max-w-4xl items-center gap-3">
                    <button
                        className="icon-button flex h-9 w-9 items-center justify-center rounded-lg"
                        onClick={() => router.back()}
                    >
                        <span>←</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Lộ trình chứng chỉ</h1>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>Chọn chứng chỉ để bắt đầu luyện tập</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-12">
                <div className="space-y-4">
                    {certifications.map((provider) => (
                        <div
                            key={provider.provider}
                            className="surface-card overflow-hidden rounded-xl"
                        >
                            {/* Provider Header */}
                            <button
                                onClick={() => setExpandedProvider(
                                    expandedProvider === provider.provider ? null : provider.provider
                                )}
                                className="flex w-full items-center justify-between border-b px-4 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                style={{ borderColor: "var(--border-clr)" }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{provider.logo}</span>
                                    <div>
                                        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{provider.provider}</h2>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            {provider.paths.length} chứng chỉ
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-lg transition-transform ${expandedProvider === provider.provider ? "rotate-180" : ""}`} style={{ color: "var(--text-muted)" }}>
                                    ▼
                                </span>
                            </button>

                            {/* Certification Paths */}
                            {expandedProvider === provider.provider && (
                                <div className="space-y-2 p-3">
                                    {provider.paths.map((cert, idx) => (
                                        <div
                                            key={cert.code}
                                            onClick={() => handleCertClick(provider.provider, cert.code, cert.status)}
                                            className={`relative rounded-lg border p-4 ${cert.status === "locked" ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"} transition-colors`}
                                            style={{ borderColor: "var(--border-clr)", background: "var(--surface)" }}
                                        >
                                            {/* Connection line (except first) */}
                                            {idx > 0 && (
                                                <div className="absolute -top-3 left-8 h-3 w-px bg-slate-300 dark:bg-slate-600"></div>
                                            )}

                                            <div className="flex items-start gap-3">
                                                {/* Step number */}
                                                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${cert.status === "completed" ? "bg-emerald-600" : cert.status === "locked" ? "bg-slate-300 dark:bg-slate-700" : "bg-blue-600"}`}>
                                                    {cert.status === "completed" ? (
                                                        <span className="text-sm text-white">✓</span>
                                                    ) : cert.status === "locked" ? (
                                                        <span className="text-sm text-slate-600 dark:text-slate-300">🔒</span>
                                                    ) : (
                                                        <span className="text-sm font-bold text-white">{idx + 1}</span>
                                                    )}
                                                </div>

                                                {/* Cert Info */}
                                                <div className="flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span className={`rounded-full border px-2 py-0.5 text-xs ${levelColors[cert.level] || "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                                                            {cert.level}
                                                        </span>
                                                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{cert.code}</span>
                                                    </div>
                                                    <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{cert.name}</h3>
                                                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
                                                        <span>🕐 {cert.duration}</span>
                                                        <span>📋 {cert.questions} câu</span>
                                                        <span>✓ {cert.passingScore}</span>
                                                    </div>
                                                </div>

                                                {/* Arrow/Lock */}
                                                <div className="flex items-center" style={{ color: "var(--text-muted)" }}>
                                                    {cert.status === "locked" ? (
                                                        <span>🔒</span>
                                                    ) : (
                                                        <span>›</span>
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
                <div className="mt-6 rounded-xl border p-4" style={{ background: "var(--primary-soft)", borderColor: "var(--primary-soft-border)" }}>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h3 className="mb-1 text-sm font-bold" style={{ color: "var(--text-primary)" }}>Mẹo luyện thi</h3>
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
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
