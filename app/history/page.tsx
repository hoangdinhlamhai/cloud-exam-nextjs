"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { useSnackbar } from "@/components/Snackbar";
import { examResultService, ExamResult, UserStats } from "@/services/exam-result";
import { getAuthToken } from "@/lib/api";

const levelColors: Record<string, string> = {
    Practitioner: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300",
    Associate: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
    Professional: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    Expert: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
};

const HistoryPage = () => {
    const router = useRouter();
    const { openSnackbar } = useSnackbar();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ExamResult[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = useCallback(async () => {
        const token = getAuthToken();
        if (!token) {
            openSnackbar({ text: "Vui lòng đăng nhập để xem lịch sử", type: "warning", duration: 3000 });
            router.push("/login");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const [historyData, statsData] = await Promise.all([
                examResultService.getHistory(page, 10),
                examResultService.getUserStats(),
            ]);
            setHistory(historyData.data);
            setTotalPages(historyData.totalPages);
            setStats(statsData);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Không thể tải lịch sử";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [page, openSnackbar, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-700 dark:text-green-300";
        if (score >= 70) return "text-amber-700 dark:text-amber-300";
        return "text-red-700 dark:text-red-300";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50";
        if (score >= 70) return "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50";
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50";
    };

    const accuracyPct = stats && stats.totalQuestions > 0
        ? Math.round((stats.totalCorrectAnswers / stats.totalQuestions) * 100)
        : 0;

    return (
        <div className="app-shell min-h-screen selection:bg-blue-100">
            {/* ════════════ HEADER ════════════ */}
            <header className="site-header sticky top-0 z-50 shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button onClick={() => router.push("/home")} className="flex items-center gap-2">
                            <span className="wordmark text-lg font-extrabold tracking-tight">
                                Cloud<span className="wordmark-accent">Exam</span>
                            </span>
                        </button>
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        <h1 className="truncate text-sm font-semibold text-slate-700 dark:text-slate-300">Lịch sử luyện tập</h1>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="secondary-action flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
                    >
                        ← Quay lại
                    </button>
                </div>
            </header>

            {/* ════════════ OVERVIEW / STATS ════════════ */}
            <section className="border-b border-[var(--border-clr)] bg-white dark:bg-slate-950">
                <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        {/* Title area */}
                        <div>
                            <p className="app-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.16em]">Theo dõi tiến độ</p>
                            <h2 className="text-2xl font-extrabold leading-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                                Lịch sử luyện tập
                            </h2>
                            <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                Xem lại kết quả các bài thi, theo dõi tiến bộ và phân tích điểm mạnh, điểm yếu.
                            </p>
                        </div>

                        {/* Stats cards */}
                        {stats && (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="surface-card min-w-[112px] rounded-lg px-4 py-3">
                                    <p className="text-xl font-black text-blue-700 dark:text-blue-300">{stats.totalExamsTaken}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Tổng đề thi</p>
                                </div>
                                <div className={`min-w-[112px] rounded-lg border px-4 py-3 shadow-sm ${getScoreBg(stats.averageScore)}`}>
                                    <p className={`text-xl font-black ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}%</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Điểm TB</p>
                                </div>
                                <div className="min-w-[112px] rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-sm dark:border-green-800 dark:bg-green-950/50">
                                    <p className="text-xl font-black text-green-700 dark:text-green-300">{stats.passedExams}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Đã đạt</p>
                                </div>
                                <div className="min-w-[112px] rounded-lg border border-red-200 bg-red-50 px-4 py-3 shadow-sm dark:border-red-800 dark:bg-red-950/50">
                                    <p className="text-xl font-black text-red-700 dark:text-red-300">{stats.failedExams}</p>
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Chưa đạt</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Accuracy progress bar */}
                    {stats && stats.totalQuestions > 0 && (
                        <div className="surface-card mt-5 rounded-lg p-4">
                            <div className="mb-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-blue-600">📊</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tỷ lệ trả lời đúng</span>
                                </div>
                                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                    {stats.totalCorrectAnswers}/{stats.totalQuestions} ({accuracyPct}%)
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-blue-600 transition-all duration-700 ease-out"
                                    style={{ width: `${accuracyPct}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ════════════ CONTENT ════════════ */}
            <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Spinner visible size="lg" />
                        <p className="text-[var(--text-muted)] text-sm">Đang tải lịch sử...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-3xl dark:border-red-800 dark:bg-red-950/50">
                            ⚠️
                        </div>
                        <p className="text-red-700 text-sm font-medium dark:text-red-300">{error}</p>
                        <button
                            onClick={fetchData}
                            className="secondary-action rounded-lg px-5 py-2.5 text-sm"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-slate-200 bg-white text-4xl shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            📝
                        </div>
                        <div className="text-center">
                            <p className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">Chưa có lịch sử</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Hoàn thành bài thi đầu tiên để xem kết quả tại đây</p>
                        </div>
                        <button
                            onClick={() => router.push("/exams")}
                            className="primary-action mt-2 flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold"
                        >
                            ▶ Làm đề ngay
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Section heading */}
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm text-white">
                                    📋
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Kết quả làm bài</h3>
                                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                    Trang {page}/{totalPages}
                                </span>
                            </div>
                        </div>

                        {/* Results table / grid */}
                        <div className="space-y-3">
                            {history.map((result) => (
                                <div
                                    key={result.id}
                                    className="group relative cursor-pointer rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                    onClick={() => router.push(`/history/detail?id=${result.id}&examId=${result.exam.id}`)}
                                >
                                    <div className="flex items-center gap-5">
                                        {/* Score badge */}
                                        <div className={`flex h-[72px] w-[72px] flex-shrink-0 flex-col items-center justify-center rounded-xl border ${result.passed
                                            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50"
                                            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50"
                                            }`}>
                                            <span className={`text-xl font-black ${result.passed ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                                                {result.score}%
                                            </span>
                                            <span className={`mt-0.5 text-[10px] font-bold uppercase tracking-wider ${result.passed ? "text-green-600 dark:text-green-300" : "text-red-600 dark:text-red-300"}`}>
                                                {result.passed ? "PASS" : "FAIL"}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0 flex-1">
                                            <h4 className="mb-1.5 line-clamp-1 text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-base">
                                                {result.exam.title}
                                            </h4>
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span className="text-xs text-slate-600 dark:text-slate-300">{result.exam.course.title}</span>
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] ${levelColors[result.exam.course.level] || "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                                                    {result.exam.course.level}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <span className={result.passed ? "text-green-600" : "text-red-600"}>✓</span>
                                                    {result.correctCount}/{result.totalQuestions} câu đúng
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    🕐 {formatDate(result.completedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Score progress ring (desktop) */}
                                        <div className="hidden flex-shrink-0 items-center gap-4 sm:flex">
                                            {/* Mini progress */}
                                            <div className="w-[100px]">
                                                <div className="mb-1 flex justify-between text-[10px]">
                                                    <span className={getScoreColor(result.score)}>{result.score}%</span>
                                                </div>
                                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${result.score >= 80
                                                            ? "bg-green-600"
                                                            : result.score >= 70
                                                                ? "bg-amber-500"
                                                                : "bg-red-600"
                                                            }`}
                                                        style={{ width: `${result.score}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <span className="text-lg text-slate-400 transition-colors group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-200">›</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="secondary-action flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    ← Trước
                                </button>

                                {/* Page dots */}
                                <div className="flex items-center gap-1 px-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors ${p === page
                                                ? "bg-blue-600 text-white"
                                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="secondary-action flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Sau →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default HistoryPage;
