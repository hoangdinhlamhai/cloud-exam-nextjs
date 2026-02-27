"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { useSnackbar } from "@/components/Snackbar";
import { examResultService, ExamResult, UserStats } from "@/services/exam-result";
import { getAuthToken } from "@/lib/api";

const levelColors: Record<string, string> = {
    Practitioner: "bg-green-500/15 text-green-400 border-green-500/25",
    Associate: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    Professional: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    Expert: "bg-pink-500/15 text-pink-400 border-pink-500/25",
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
        if (score >= 80) return "text-green-400";
        if (score >= 70) return "text-yellow-400";
        return "text-red-400";
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return "from-green-500/20 to-emerald-500/20 border-green-500/30";
        if (score >= 70) return "from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
        return "from-red-500/20 to-orange-500/20 border-red-500/30";
    };

    const accuracyPct = stats && stats.totalQuestions > 0
        ? Math.round((stats.totalCorrectAnswers / stats.totalQuestions) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
            {/* ════════════ HEADER ════════════ */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="mx-auto max-w-7xl flex items-center justify-between px-5 py-3 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push("/home")} className="flex items-center gap-2 group">
                            <span className="text-lg font-extrabold tracking-tight">
                                Cloud<span className="text-cyan-400">Exam</span>
                            </span>
                        </button>
                        <span className="text-slate-600">/</span>
                        <h1 className="text-sm font-semibold text-slate-300">Lịch sử luyện tập</h1>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 rounded-xl border border-white/10 hover:bg-white/[0.06] hover:text-white transition-all"
                    >
                        ← Quay lại
                    </button>
                </div>
            </header>

            {/* ════════════ HERO / STATS ════════════ */}
            <section className="relative overflow-hidden border-b border-white/[0.06]">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-[400px] w-[700px] rounded-full bg-gradient-to-b from-cyan-600/15 via-blue-600/10 to-transparent blur-3xl" />
                    <div className="absolute top-20 right-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14">
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                        {/* Title area */}
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-4 py-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span className="text-xs font-medium text-cyan-300">Theo dõi tiến độ</span>
                            </div>
                            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                                Lịch sử <span className="text-cyan-400">luyện tập</span>
                            </h2>
                            <p className="mt-3 max-w-lg text-slate-400 leading-relaxed">
                                Xem lại kết quả các bài thi, theo dõi tiến bộ và phân tích điểm mạnh, điểm yếu.
                            </p>
                        </div>

                        {/* Stats cards */}
                        {stats && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-500/25 rounded-2xl px-5 py-4 text-center">
                                    <p className="text-2xl font-black text-cyan-400">{stats.totalExamsTaken}</p>
                                    <p className="text-xs text-slate-500 mt-1">Tổng đề thi</p>
                                </div>
                                <div className={`bg-gradient-to-br ${getScoreBg(stats.averageScore)} rounded-2xl px-5 py-4 text-center`}>
                                    <p className={`text-2xl font-black ${getScoreColor(stats.averageScore)}`}>{stats.averageScore}%</p>
                                    <p className="text-xs text-slate-500 mt-1">Điểm TB</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-500/15 to-emerald-500/15 border border-green-500/25 rounded-2xl px-5 py-4 text-center">
                                    <p className="text-2xl font-black text-green-400">{stats.passedExams}</p>
                                    <p className="text-xs text-slate-500 mt-1">Đã đạt</p>
                                </div>
                                <div className="bg-gradient-to-br from-red-500/15 to-orange-500/15 border border-red-500/25 rounded-2xl px-5 py-4 text-center">
                                    <p className="text-2xl font-black text-red-400">{stats.failedExams}</p>
                                    <p className="text-xs text-slate-500 mt-1">Chưa đạt</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Accuracy progress bar */}
                    {stats && stats.totalQuestions > 0 && (
                        <div className="mt-6 bg-slate-900/60 border border-white/[0.06] rounded-2xl p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-cyan-400 text-sm">📊</span>
                                    <span className="text-sm font-semibold text-white">Tỷ lệ trả lời đúng</span>
                                </div>
                                <span className="text-sm font-bold text-cyan-400">
                                    {stats.totalCorrectAnswers}/{stats.totalQuestions} ({accuracyPct}%)
                                </span>
                            </div>
                            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-700 ease-out"
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
                        <p className="text-slate-500 text-sm">Đang tải lịch sử...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-3xl">
                            ⚠️
                        </div>
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                        <button
                            onClick={fetchData}
                            className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm hover:bg-slate-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/80 border border-white/[0.06] text-4xl">
                            📝
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-white mb-1">Chưa có lịch sử</p>
                            <p className="text-sm text-slate-500">Hoàn thành bài thi đầu tiên để xem kết quả tại đây</p>
                        </div>
                        <button
                            onClick={() => router.push("/exams")}
                            className="mt-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity shadow-lg shadow-cyan-600/20"
                        >
                            ▶ Làm đề ngay
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Section heading */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-sm">
                                    📋
                                </div>
                                <h3 className="text-base font-bold text-white">Kết quả làm bài</h3>
                                <span className="text-xs font-medium text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-full">
                                    Trang {page}/{totalPages}
                                </span>
                            </div>
                        </div>

                        {/* Results table / grid */}
                        <div className="space-y-3">
                            {history.map((result) => (
                                <div
                                    key={result.id}
                                    className="group relative rounded-2xl border border-white/[0.06] bg-slate-900/50 p-5 transition-all duration-300 hover:border-white/[0.12] hover:bg-slate-900/80 hover:-translate-y-0.5 cursor-pointer"
                                    onClick={() => router.push(`/history/detail?id=${result.id}&examId=${result.exam.id}`)}
                                >
                                    {/* Hover glow */}
                                    <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-15 ${result.passed ? "bg-green-500" : "bg-red-500"}`} />

                                    <div className="relative flex items-center gap-5">
                                        {/* Score badge */}
                                        <div className={`flex-shrink-0 w-[72px] h-[72px] rounded-2xl flex flex-col items-center justify-center ${result.passed
                                            ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30"
                                            : "bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30"
                                            }`}>
                                            <span className={`text-xl font-black ${result.passed ? "text-green-400" : "text-red-400"}`}>
                                                {result.score}%
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${result.passed ? "text-green-500/70" : "text-red-500/70"}`}>
                                                {result.passed ? "PASS" : "FAIL"}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-bold text-sm sm:text-base line-clamp-1 mb-1.5">
                                                {result.exam.title}
                                            </h4>
                                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                                <span className="text-xs text-slate-400">{result.exam.course.title}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${levelColors[result.exam.course.level] || "bg-slate-500/15 text-slate-400 border-slate-500/25"}`}>
                                                    {result.exam.course.level}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <span className={result.passed ? "text-green-500" : "text-red-500"}>✓</span>
                                                    {result.correctCount}/{result.totalQuestions} câu đúng
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    🕐 {formatDate(result.completedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Score progress ring (desktop) */}
                                        <div className="hidden sm:flex flex-shrink-0 items-center gap-4">
                                            {/* Mini progress */}
                                            <div className="w-[100px]">
                                                <div className="flex justify-between text-[10px] mb-1">
                                                    <span className={getScoreColor(result.score)}>{result.score}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${result.score >= 80
                                                            ? "bg-gradient-to-r from-green-400 to-emerald-500"
                                                            : result.score >= 70
                                                                ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                                                                : "bg-gradient-to-r from-red-400 to-orange-500"
                                                            }`}
                                                        style={{ width: `${result.score}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <span className="text-slate-600 group-hover:text-slate-400 transition-colors text-lg">›</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900/60 border border-white/[0.06] text-white text-sm rounded-xl disabled:opacity-40 hover:bg-slate-800 transition-colors"
                                >
                                    ← Trước
                                </button>

                                {/* Page dots */}
                                <div className="flex items-center gap-1 px-2">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === page
                                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-600/20"
                                                : "text-slate-500 hover:bg-white/[0.06] hover:text-white"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900/60 border border-white/[0.06] text-white text-sm rounded-xl disabled:opacity-40 hover:bg-slate-800 transition-colors"
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
