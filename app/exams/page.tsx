"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import { examService, Exam, ExamListResponse } from "@/services/exam";
import { courseService, Course } from "@/services/course";

/* ──────────── helpers / config ──────────── */

const levelMeta: Record<string, { label: string; dot: string; badge: string }> = {
    Foundational: { label: "Foundational", dot: "bg-green-400", badge: "border-green-500/30 bg-green-500/10 text-green-400" },
    Associate: { label: "Associate", dot: "bg-blue-400", badge: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
    Professional: { label: "Professional", dot: "bg-purple-400", badge: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
    Specialty: { label: "Specialty", dot: "bg-pink-400", badge: "border-pink-500/30 bg-pink-500/10 text-pink-400" },
};

const providerMeta: Record<string, { icon: string; gradient: string }> = {
    AWS: { icon: "🔶", gradient: "from-orange-500 to-amber-400" },
    Azure: { icon: "🔷", gradient: "from-blue-500 to-cyan-400" },
    GCP: { icon: "🔴", gradient: "from-red-500 to-yellow-400" },
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
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

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
            const res: ExamListResponse = await examService.getAll(page, 12, courseId);

            setExams(res.data);
            setTotalPages(res.totalPages);
            setTotal(res.total);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể tải danh sách đề thi");
        } finally {
            setIsLoading(false);
        }
    }, [page, courseIdParam, course]);

    useEffect(() => {
        fetchExams();
    }, [fetchExams]);

    /* Reset page when filters change (client-side filters) */
    useEffect(() => {
        setPage(1);
    }, [search, sort, questionFilter]);

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
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
            {/* ═══════ HEADER ═══════ */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
                    {/* Logo */}
                    <button onClick={() => router.push("/home")} className="flex items-center gap-2.5 group">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-cyan-400 blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg">
                                <span className="text-base font-black text-white">C</span>
                            </div>
                        </div>
                        <span className="text-lg font-extrabold tracking-tight">
                            Cloud<span className="text-cyan-400">Exam</span>
                        </span>
                    </button>

                    {/* Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {[
                            { label: "Trang chủ", route: "/home" },
                            { label: "Khoá học", route: "/courses" },
                            { label: "Đề thi", route: "/exams" },
                            { label: "Lịch sử", route: "/history" },
                        ].map((l) => (
                            <button
                                key={l.route}
                                onClick={() => router.push(l.route)}
                                className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-colors ${l.route === "/exams"
                                    ? "text-cyan-300 bg-cyan-500/10"
                                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                                    }`}
                            >
                                {l.label}
                            </button>
                        ))}
                    </nav>

                    <button
                        onClick={() => router.push("/home")}
                        className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/[0.06]"
                    >
                        ←
                    </button>
                </div>
            </header>

            {/* ═══════ HERO / PAGE TITLE ═══════ */}
            <section className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-b from-slate-900/50 to-slate-950">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-gradient-to-b from-cyan-600/15 to-transparent blur-3xl" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 pt-14 pb-10">
                    <div className="flex flex-col gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400 mb-1">
                            Luyện tập
                        </p>
                        <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                            Đề thi <span className="text-cyan-400">thực chiến</span>
                        </h1>
                        <p className="mt-4 max-w-2xl text-base text-slate-400 leading-relaxed sm:text-lg">
                            Luyện tập với hàng trăm đề thi mô phỏng sát kì thi thật AWS, Azure & GCP.
                        </p>
                    </div>

                    {/* Course info banner with thumbnail */}
                    {course && (() => {
                        const courseProv = providerMeta[course.provider?.name] || { icon: "☁️", gradient: "from-slate-500 to-slate-400" };
                        const courseLvl = levelMeta[course.level] || levelMeta.Associate;
                        return (
                            <div className="mt-8 flex flex-col sm:flex-row items-start gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-5 relative overflow-hidden">
                                {/* Background glow */}
                                <div className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${courseProv.gradient} opacity-10 blur-3xl`} />

                                {/* Thumbnail */}
                                {course.thumbnailUrl ? (
                                    <div className="relative flex-shrink-0">
                                        <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${courseProv.gradient} opacity-20 blur-lg`} />
                                        <img
                                            src={course.thumbnailUrl}
                                            alt={course.title}
                                            className="relative w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-xl border border-white/10 bg-white/[0.06] p-3"
                                        />
                                    </div>
                                ) : (
                                    <div className={`flex-shrink-0 flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-white/10 bg-gradient-to-br ${courseProv.gradient} opacity-80`}>
                                        <span className="text-4xl">{courseProv.icon}</span>
                                    </div>
                                )}

                                {/* Course details */}
                                <div className="relative z-10 flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg">{courseProv.icon}</span>
                                        <span className="text-xs font-semibold text-slate-400">{course.provider?.name || "Cloud"}</span>
                                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${courseLvl.badge}`}>
                                            {courseLvl.label}
                                        </span>
                                    </div>
                                    <h2 className="text-lg sm:text-xl font-bold text-white leading-snug mb-1.5 line-clamp-2">
                                        {course.title}
                                    </h2>
                                    {course.description && (
                                        <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-3">
                                            {course.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                                            <span className="text-cyan-500">📋</span>
                                            <span className="font-semibold text-slate-300">{course._count?.exams ?? total}</span> đề thi
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); router.push("/courses"); }}
                                            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
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
            <section className="sticky top-[57px] z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="mx-auto max-w-7xl px-5 lg:px-8 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
                        <input
                            type="text"
                            placeholder="Tìm đề thi…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                        />
                    </div>

                    {/* Filters Group */}
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                        {/* Sort Dropdown simulated with select */}
                        <div className="relative">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="appearance-none rounded-lg border border-white/10 bg-slate-900 py-2 pl-3 pr-8 text-xs font-semibold text-slate-300 focus:outline-none focus:border-cyan-500/50 hover:bg-white/[0.06] transition-colors cursor-pointer"
                            >
                                {sortOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] pointer-events-none">▼</span>
                        </div>

                        <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

                        {/* Question Count Pills */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            {questionCountOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setQuestionFilter(opt.value)}
                                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${questionFilter === opt.value
                                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                        : "text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/[0.06]"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CONTENT ═══════ */}
            <main className="mx-auto max-w-7xl px-5 lg:px-8 pt-8 pb-20">
                {/* Result count */}
                {!isLoading && !error && (
                    <p className="mb-6 text-sm text-slate-500">
                        Hiển thị <span className="text-slate-300 font-semibold">{filteredExams.length}</span> / {total} đề thi
                    </p>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Spinner visible />
                        <p className="text-slate-500 text-sm">Đang tải đề thi…</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <span className="text-4xl">⚠️</span>
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                        <button
                            onClick={fetchExams}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !error && filteredExams.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <span className="text-5xl">📝</span>
                        <p className="text-slate-400 text-base font-medium">Không tìm thấy đề thi nào</p>
                        <button
                            onClick={() => { setSearch(""); setQuestionFilter("all"); setSort("newest"); }}
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300 hover:bg-white/[0.08] transition-colors"
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
                                const levelName = exam.course?.level || "Associate";
                                const lvl = levelMeta[levelName] || levelMeta.Associate;

                                return (
                                    <article
                                        key={exam.id}
                                        onClick={() => router.push(`/exam-mode?id=${exam.id}`)}
                                        className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-900/60 transition-all duration-300 hover:border-white/[0.12] hover:bg-slate-900/80 hover:-translate-y-1"
                                    >
                                        {/* Top accent stripe */}
                                        <div className={`h-1.5 bg-gradient-to-r ${prov.gradient}`} />

                                        {/* Body */}
                                        <div className="p-6">
                                            {/* Provider + Level row */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{prov.icon}</span>
                                                    <span className="text-xs font-semibold text-slate-400">{providerName}</span>
                                                </div>
                                                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${lvl.badge}`}>
                                                    {lvl.label}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold leading-snug text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
                                                {exam.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-5">
                                                {exam.description || `Đề thi thực hành ${exam.title} với ${exam._count?.questions ?? 0} câu hỏi trắc nghiệm và giải thích chi tiết.`}
                                            </p>

                                            {/* Footer meta */}
                                            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                                    <div className="flex items-center gap-1.5">
                                                        <span>🕐</span>
                                                        <span className="font-medium text-slate-300">{exam.durationMinutes}p</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span>📋</span>
                                                        <span className="font-medium text-slate-300">{exam._count?.questions ?? 0} câu</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100">
                                                    Làm bài <span className="transition-transform group-hover:translate-x-0.5">→</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hover glow */}
                                        <div className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${prov.gradient} opacity-0 blur-3xl transition-opacity group-hover:opacity-15`} />
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
                                    className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 disabled:opacity-40 hover:bg-white/[0.08] transition-colors"
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
                                            <span key={`dot-${idx}`} className="px-2 text-slate-600">…</span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${page === p
                                                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                                    : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}

                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 disabled:opacity-40 hover:bg-white/[0.08] transition-colors"
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
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Spinner visible />
                <p className="text-slate-500 text-sm mt-3">Đang tải trang...</p>
            </div>
        }>
            <ExamsContent />
        </Suspense>
    );
};

export default ExamsPage;
