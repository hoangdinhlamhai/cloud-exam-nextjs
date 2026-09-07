"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import { examService, Exam, ExamListResponse } from "@/services/exam";
import { courseService, Course, Provider } from "@/services/course";

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

// Filter options
const sortOptions = [
    { label: "Mới nhất", value: "newest" },
    { label: "Nhiều câu nhất", value: "most_questions" },
    { label: "Thời gian ngắn nhất", value: "shortest" },
] as const;

const questionCountOptions = [
    { label: "Tất cả", value: "all" },
    { label: "< 30 câu", value: "short" },
    { label: "30-65 câu", value: "medium" },
    { label: "> 65 câu", value: "long" },
] as const;

function ExamsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseIdParam = searchParams.get("courseId");

    /* state */
    const [exams, setExams] = useState<Exam[]>([]);
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<string>("newest");
    const [questionFilter, setQuestionFilter] = useState<string>("all");
    const [activeProvider, setActiveProvider] = useState<string>("All");
    const [providers, setProviders] = useState<Provider[]>([]);
    const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

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

    /* fetch all providers on mount */
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const res = await courseService.getAll(1, 100);
                const uniqueProviders = res.data
                    .map(c => c.provider)
                    .filter((p, i, arr) => p && arr.findIndex(x => x.id === p.id) === i);
                setProviders(uniqueProviders);
            } catch {
                // silently fail
            }
        };
        fetchProviders();
    }, []);

    /* fetch */
    const fetchExams = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch course info if filtered
            if (courseIdParam && !course) {
                const courseData = await courseService.getById(parseInt(courseIdParam));
                setCourse(courseData);
            }

            // Fetch exams
            const courseId = courseIdParam ? parseInt(courseIdParam) : undefined;
            const selectedProvider = providersRef.current.find(p => p.name === activeProvider);
            const providerId = selectedProvider ? selectedProvider.id : undefined;
            const res: ExamListResponse = await examService.getAll(page, 12, courseId, providerId);

            setExams(res.data);
            setTotalPages(res.totalPages);
            setTotal(res.total);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể tải danh sách đề thi");
        } finally {
            setIsLoading(false);
        }
    }, [page, courseIdParam, course, activeProvider]);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    /* Reset page when filters change */
    useEffect(() => {
        setPage(1);
    }, [search, sort, questionFilter, activeProvider]);

    /* Client-side filtering & sorting */
    const filteredExams = React.useMemo(() => {
        let result = [...exams];

        // Search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(e => e.title.toLowerCase().includes(q));
        }

        // Question count filter — always use _count.questions (real count)
        const qCount = (e: Exam) => e._count?.questions ?? 0;
        if (questionFilter === "short") result = result.filter(e => qCount(e) < 30);
        else if (questionFilter === "medium") result = result.filter(e => qCount(e) >= 30 && qCount(e) <= 65);
        else if (questionFilter === "long") result = result.filter(e => qCount(e) > 65);

        // Sort
        if (sort === "most_questions") result.sort((a, b) => (b._count?.questions ?? 0) - (a._count?.questions ?? 0));
        else if (sort === "shortest") result.sort((a, b) => a.durationMinutes - b.durationMinutes);
        else {
            // Newest (default) - assuming ID correlates with time or date string
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        return result;
    }, [exams, search, sort, questionFilter]);

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
                                className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-colors ${l.route === "/exams"
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
                    <div className="flex flex-col gap-2">
                        <p className="app-eyebrow mb-1 text-xs font-semibold uppercase tracking-[0.2em]">
                            Luyện tập
                        </p>
                        <h1 className="text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "var(--text-primary)" }}>
                            Đề thi <span className="wordmark-accent">thực chiến</span>
                        </h1>
                        <p className="mt-4 max-w-2xl text-base leading-relaxed sm:text-lg" style={{ color: "var(--text-secondary)" }}>
                            Luyện tập với hàng trăm đề thi mô phỏng sát kì thi thật AWS, Azure & GCP.
                        </p>
                    </div>

                    {/* Course info banner with thumbnail */}
                    {course && (() => {
                        const courseProv = providerMeta[course.provider?.name] || { icon: "☁️", accent: "bg-blue-600" };
                        const courseLvl = levelMeta[course.level] || levelMeta.Associate;
                        return (
                            <div className="surface-card mt-8 flex flex-col items-start gap-5 rounded-xl p-5 sm:flex-row">
                                {/* Thumbnail */}
                                {course.thumbnailUrl ? (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={course.thumbnailUrl}
                                            alt={course.title}
                                            className="h-24 w-24 rounded-lg border bg-white p-3 object-contain sm:h-28 sm:w-28 dark:bg-slate-800"
                                            style={{ borderColor: "var(--border-clr)" }}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg border bg-slate-50 sm:h-28 sm:w-28 dark:bg-slate-800" style={{ borderColor: "var(--border-clr)" }}>
                                        <span className="text-4xl">{courseProv.icon}</span>
                                    </div>
                                )}

                                {/* Course details */}
                                <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="text-lg">{courseProv.icon}</span>
                                        <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{course.provider?.name || "Cloud"}</span>
                                        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${courseLvl.badge} dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200`}>
                                            {courseLvl.label}
                                        </span>
                                    </div>
                                    <h2 className="mb-1.5 line-clamp-2 text-lg font-bold leading-snug sm:text-xl" style={{ color: "var(--text-primary)" }}>
                                        {course.title}
                                    </h2>
                                    {course.description && (
                                        <p className="mb-3 line-clamp-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                            {course.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                                            <span>📋</span>
                                            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{course._count?.exams ?? total}</span> đề thi
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); router.push("/courses"); }}
                                            className="app-link text-xs font-medium transition-colors"
                                        >
                                            ← Quay lại khoá học
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </section>

            {/* ═══════ FILTERS BAR ═══════ */}
            <section className="sticky top-[57px] z-40 border-b" style={{ background: "var(--header-bg)", borderColor: "var(--border-clr)" }}>
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:px-8">
                    {/* Search */}
                    <div className="relative max-w-md flex-1">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--text-muted)" }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm đề thi…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="form-input w-full rounded-lg py-2.5 pl-10 pr-4 text-sm"
                        />
                    </div>

                    {/* Provider dropdown */}
                    {!courseIdParam && (
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
                    )}

                    {/* Filters Group */}
                    <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
                        {/* Sort Dropdown simulated with select */}
                        <div className="relative">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="form-input cursor-pointer appearance-none rounded-lg py-2 pl-3 pr-8 text-xs font-semibold"
                            >
                                {sortOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: "var(--text-muted)" }}>▼</span>
                        </div>

                        <div className="hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-700"></div>

                        {/* Question Count Pills */}
                        <div className="flex flex-shrink-0 items-center gap-1.5">
                            {questionCountOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setQuestionFilter(opt.value)}
                                    className={`whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${questionFilter === opt.value
                                        ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                                        : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                                        }`}
                                    style={{ color: questionFilter === opt.value ? undefined : "var(--text-secondary)" }}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CONTENT ═══════ */}
            <main className="mx-auto max-w-7xl px-5 pb-20 pt-8 lg:px-8">
                {/* Result count */}
                {!isLoading && !error && (
                    <p className="mb-6 text-sm" style={{ color: "var(--text-muted)" }}>
                        Hiển thị <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{filteredExams.length}</span> / {total} đề thi
                        {activeProvider !== "All" && (
                            <span> · Nhà cung cấp: <span className="app-link">{activeProvider}</span></span>
                        )}
                    </p>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center gap-4 py-32">
                        <Spinner visible />
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Đang tải đề thi…</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex flex-col items-center justify-center gap-4 py-32">
                        <span className="text-4xl">⚠️</span>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                        <button
                            onClick={fetchExams}
                            className="primary-action rounded-lg px-4 py-2 text-sm font-semibold"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !error && filteredExams.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-4 py-32">
                        <span className="text-5xl">📝</span>
                        <p className="text-base font-medium" style={{ color: "var(--text-secondary)" }}>Không tìm thấy đề thi nào</p>
                        <button
                            onClick={() => { setSearch(""); setQuestionFilter("all"); setSort("newest"); setActiveProvider("All"); }}
                            className="secondary-action rounded-lg px-4 py-2 text-sm font-medium"
                        >
                            Xoá bộ lọc
                        </button>
                    </div>
                )}

                {/* Exam grid */}
                {!isLoading && !error && filteredExams.length > 0 && (
                    <>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredExams.map((exam) => {
                                // Assume provider name can be derived or default
                                const providerName = exam.course?.title.includes("AWS") ? "AWS"
                                    : exam.course?.title.includes("Azure") ? "Azure"
                                        : exam.course?.title.includes("Google") ? "GCP" : "AWS";

                                const prov = providerMeta[providerName] || providerMeta.AWS;


                                return (
                                    <article
                                        key={exam.id}
                                        onClick={() => router.push(`/exam-mode?id=${exam.id}`)}
                                        className="surface-card cursor-pointer overflow-hidden rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        {/* Top accent stripe */}
                                        <div className={`h-1 ${prov.accent}`} />

                                        {/* Body */}
                                        <div className="p-6">
                                            {/* Provider + Level row */}
                                            <div className="mb-4 flex items-center gap-2">
                                                <span className="text-xl">{prov.icon}</span>
                                                <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{providerName}</span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug" style={{ color: "var(--text-primary)" }}>
                                                {exam.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="mb-5 line-clamp-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                                {exam.description || `Đề thi thực hành ${exam.title} với ${exam._count?.questions ?? 0} câu hỏi trắc nghiệm và giải thích chi tiết.`}
                                            </p>

                                            {/* Footer meta */}
                                            <div className="flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--border-clr)" }}>
                                                <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                                                    <div className="flex items-center gap-1.5">
                                                        <span>🕐</span>
                                                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{exam.durationMinutes}p</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span>📋</span>
                                                        <span className="font-medium" style={{ color: "var(--text-primary)" }}>{exam._count?.questions ?? 0} câu</span>
                                                    </div>
                                                </div>
                                                <div className="app-link flex items-center gap-1 text-xs font-semibold">
                                                    Làm bài <span>→</span>
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
}

const ExamsPage = () => {
    return (
        <Suspense fallback={
            <div className="app-shell flex min-h-screen flex-col items-center justify-center">
                <Spinner visible />
                <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>Đang tải trang...</p>
            </div>
        }>
            <ExamsContent />
        </Suspense>
    );
};

export default ExamsPage;
