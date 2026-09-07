"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { courseService, Course, CourseListResponse, Provider } from "@/services/course";

/* ──────────── helpers / config ──────────── */

const levelMeta: Record<string, { label: string; dot: string; badge: string }> = {
    Practitioner: { label: "Practitioner", dot: "bg-emerald-500", badge: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    Associate: { label: "Associate", dot: "bg-blue-500", badge: "border-blue-200 bg-blue-50 text-blue-700" },
    Professional: { label: "Professional", dot: "bg-violet-500", badge: "border-violet-200 bg-violet-50 text-violet-700" },
    Expert: { label: "Expert", dot: "bg-pink-500", badge: "border-pink-200 bg-pink-50 text-pink-700" },
};

const providerMeta: Record<string, { icon: string; accent: string }> = {
    AWS: { icon: "🔶", accent: "bg-blue-600" },
    Azure: { icon: "🔷", accent: "bg-blue-600" },
    GCP: { icon: "🔴", accent: "bg-blue-600" },
};

const allLevels = ["All", "Practitioner", "Associate", "Professional", "Expert"] as const;

/* ──────────── component ──────────── */

const CoursesPage = () => {
    const router = useRouter();

    /* state */
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [activeLevel, setActiveLevel] = useState<string>("All");
    const [activeProvider, setActiveProvider] = useState<string>("All");
    const [providers, setProviders] = useState<Provider[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);

    /* refs */
    const providersRef = useRef<Provider[]>([]);
    providersRef.current = providers;
    const dropdownRef = useRef<HTMLDivElement>(null);

    /* close dropdown on click outside */
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setProviderDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* fetch */
    const fetchCourses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const level = activeLevel === "All" ? undefined : activeLevel;
            const selectedProvider = providersRef.current.find(p => p.name === activeProvider);
            const providerId = selectedProvider ? selectedProvider.id : undefined;
            const res: CourseListResponse = await courseService.getAll(page, 12, providerId, level, search || undefined);
            setCourses(res.data);
            setTotalPages(res.totalPages);
            setTotal(res.total);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể tải danh sách khoá học");
        } finally {
            setIsLoading(false);
        }
    }, [page, activeLevel, activeProvider, search]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    /* reset to page 1 when filters change */
    useEffect(() => {
        setPage(1);
    }, [activeLevel, activeProvider, search]);

    /* fetch all providers on mount (unfiltered) */
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const res = await courseService.getAll(1, 100);
                const uniqueProviders = res.data
                    .map(c => c.provider)
                    .filter((p, i, arr) => p && arr.findIndex(x => x.id === p.id) === i);
                setProviders(uniqueProviders);
            } catch {
                // silently fail — providers just won't show
            }
        };
        fetchProviders();
    }, []);

    /* ──── render ──── */
    return (
        <div className="app-shell min-h-screen">
            {/* ═══════ HEADER ═══════ */}
            <header className="site-header sticky top-0 z-50">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
                    {/* Logo */}
                    <button onClick={() => router.push("/home")} className="flex items-center gap-2.5 rounded-lg">
                        <span className="brand-mark flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold">C</span>
                        <span className="wordmark text-lg font-bold tracking-tight">
                            Cloud<span className="wordmark-accent">Exam</span>
                        </span>
                    </button>

                    {/* Nav */}
                    <nav className="hidden items-center gap-1 md:flex">
                        {[
                            { label: "Trang chủ", route: "/home" },
                            { label: "Khoá học", route: "/courses" },
                            { label: "Đề thi", route: "/exams" },
                            { label: "Lịch sử", route: "/history" },
                        ].map((l) => (
                            <button
                                key={l.route}
                                onClick={() => router.push(l.route)}
                                className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${l.route === "/courses"
                                    ? "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                                    : "nav-link"
                                    }`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </nav>

                    <button
                        onClick={() => router.push("/home")}
                        className="icon-button flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
                    >
                        ←
                    </button>
                </div>
            </header>

            {/* ═══════ HERO / PAGE TITLE ═══════ */}
            <section className="border-b" style={{ borderColor: "var(--border-clr)" }}>
                <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
                    <p className="app-eyebrow mb-3 text-xs font-semibold uppercase tracking-[0.2em]">
                        Khám phá
                    </p>
                    <h1 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
                        Khoá học <span className="wordmark-accent">Cloud Computing</span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: "var(--text-secondary)" }}>
                        Lựa chọn từ các khoá học AWS, Azure & GCP — từ nền tảng đến chuyên sâu.
                        Mỗi khoá bao gồm đề thi thực chiến và giải thích chi tiết.
                    </p>
                </div>
            </section>

            {/* ═══════ FILTERS BAR ═══════ */}
            <section className="sticky top-[57px] z-40 border-b" style={{ background: "var(--header-bg)", borderColor: "var(--border-clr)" }}>
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center lg:px-8">
                    {/* Search */}
                    <div className="relative max-w-md flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm khoá học…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="form-input w-full rounded-lg py-2.5 pl-10 pr-4 text-sm"
                        />
                    </div>

                    {/* Provider dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setProviderDropdownOpen(!providerDropdownOpen)}
                            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm font-semibold transition-colors ${activeProvider !== "All"
                                ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                                : "secondary-action"
                                }`}
                        >
                            <span>{activeProvider === "All" ? "☁️" : (providerMeta[activeProvider]?.icon || "☁️")}</span>
                            <span>{activeProvider === "All" ? "Nhà cung cấp" : activeProvider}</span>
                            <svg
                                className={`h-3.5 w-3.5 transition-transform ${providerDropdownOpen ? "rotate-180" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        {/* Dropdown panel */}
                        {providerDropdownOpen && (
                            <div className="surface-card absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-lg py-1.5">
                                <button
                                    onClick={() => { setActiveProvider("All"); setProviderDropdownOpen(false); }}
                                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${activeProvider === "All"
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                        : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                        }`}
                                    style={{ color: activeProvider === "All" ? undefined : "var(--text-secondary)" }}
                                >
                                    <span>☁️</span>
                                    <span>Tất cả</span>
                                    {activeProvider === "All" && (
                                        <svg className="ml-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                    )}
                                </button>
                                {providers.map((prov) => {
                                    const meta = providerMeta[prov.name] || { icon: "☁️", accent: "bg-blue-600" };
                                    return (
                                        <button
                                            key={prov.id}
                                            onClick={() => { setActiveProvider(prov.name); setProviderDropdownOpen(false); }}
                                            className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${activeProvider === prov.name
                                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                                : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                                }`}
                                            style={{ color: activeProvider === prov.name ? undefined : "var(--text-secondary)" }}
                                        >
                                            <span>{meta.icon}</span>
                                            <span>{prov.name}</span>
                                            {activeProvider === prov.name && (
                                                <svg className="ml-auto h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Level pills */}
                    <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
                        {allLevels.map((lvl) => (
                            <button
                                key={lvl}
                                onClick={() => setActiveLevel(lvl)}
                                className={`whitespace-nowrap rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${activeLevel === lvl
                                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                                    : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                                style={{ color: activeLevel === lvl ? undefined : "var(--text-secondary)" }}
                            >
                                {lvl === "All" ? "Tất cả" : lvl}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ CONTENT ═══════ */}
            <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 lg:px-8">
                {/* Result count */}
                {!isLoading && !error && (
                    <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
                        Hiển thị <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{courses.length}</span> / {total} khoá học
                        {activeProvider !== "All" && (
                            <span> · Nhà cung cấp: <span className="app-link">{activeProvider}</span></span>
                        )}
                        {activeLevel !== "All" && (
                            <span> · Cấp độ: <span className="app-link">{activeLevel}</span></span>
                        )}
                    </p>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center gap-4 py-32">
                        <Spinner visible />
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Đang tải khoá học…</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex flex-col items-center justify-center gap-4 py-32">
                        <span className="text-4xl">⚠️</span>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                        <button
                            onClick={fetchCourses}
                            className="primary-action rounded-lg px-4 py-2 text-sm font-semibold"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !error && courses.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-4 py-32">
                        <span className="text-5xl">📚</span>
                        <p className="text-base font-medium" style={{ color: "var(--text-secondary)" }}>Không tìm thấy khoá học nào</p>
                        <button
                            onClick={() => { setSearch(""); setActiveLevel("All"); setActiveProvider("All"); }}
                            className="secondary-action rounded-lg px-4 py-2 text-sm font-medium"
                        >
                            Xoá bộ lọc
                        </button>
                    </div>
                )}

                {/* Course grid */}
                {!isLoading && !error && courses.length > 0 && (
                    <>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {courses.map((course) => {
                                const prov = providerMeta[course.provider?.name] || { icon: "☁️", accent: "bg-blue-600" };
                                const lvl = levelMeta[course.level] || levelMeta.Practitioner;
                                return (
                                    <article
                                        key={course.id}
                                        onClick={() => router.push(`/exams?courseId=${course.id}`)}
                                        className="surface-card cursor-pointer overflow-hidden rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        {/* Top accent stripe */}
                                        <div className={`h-1 ${prov.accent}`} />

                                        {/* Body */}
                                        <div className="p-6">
                                            {/* Provider + Level row */}
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{prov.icon}</span>
                                                    <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{course.provider?.name || "Cloud"}</span>
                                                </div>
                                                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${lvl.badge} dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200`}>
                                                    {lvl.label}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
                                                {course.title}
                                            </h3>

                                            {/* Description */}
                                            {course.description && (
                                                <p className="mb-5 line-clamp-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                                    {course.description}
                                                </p>
                                            )}

                                            {/* Footer meta */}
                                            <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--border-clr)" }}>
                                                <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                                                    <span>📋</span>
                                                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{course._count?.exams ?? 0}</span>
                                                    <span>đề thi</span>
                                                </div>
                                                <div className="app-link flex items-center gap-1 text-xs font-semibold">
                                                    Xem đề <span>→</span>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="secondary-action rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40"
                                >
                                    ‹ Trước
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                    .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                                        if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, idx) =>
                                        p === "…" ? (
                                            <span key={`dot-${idx}`} className="px-2" style={{ color: "var(--text-muted)" }}>…</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`h-9 w-9 rounded-lg border text-sm font-semibold transition-colors ${page === p
                                                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                                                    : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                                                    }`}
                                                style={{ color: page === p ? undefined : "var(--text-secondary)" }}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="secondary-action rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-40"
                                >
                                    Sau ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default CoursesPage;
