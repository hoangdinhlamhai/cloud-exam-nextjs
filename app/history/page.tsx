"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
import { useSnackbar } from "@/components/Snackbar";
import { examResultService, ExamResult, UserStats, ExamHistoryResponse } from "@/services/exam-result";
import { getAuthToken } from "@/lib/api";

// Level colors
const levelColors: Record<string, string> = {
    Practitioner: "bg-green-500/20 text-green-400",
    Associate: "bg-blue-500/20 text-blue-400",
    Professional: "bg-purple-500/20 text-purple-400",
    Expert: "bg-pink-500/20 text-pink-400",
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
            openSnackbar({
                text: "Vui lòng đăng nhập để xem lịch sử",
                type: "warning",
                duration: 3000,
            });
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
            console.error("Fetch history error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [page, openSnackbar, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-400";
        if (score >= 70) return "text-yellow-400";
        return "text-red-400";
    };

    return (
        <div className="bg-slate-900 flex flex-col min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <header className="sticky top-0 z-50 px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button
                        className="w-9 h-9 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => router.back()}
                    >
                        <span className="text-white">←</span>
                    </button>
                    <h1 className="text-white text-lg font-bold">Lịch sử luyện tập</h1>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 px-4 py-4 overflow-y-auto pb-20">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Spinner visible />
                        <p className="text-slate-400 text-sm">Đang tải...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <span className="text-red-400 text-4xl">⚠</span>
                        <p className="text-red-400 text-sm">{error}</p>
                        <button
                            onClick={fetchData}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        {stats && (
                            <div className="mb-6">
                                <h2 className="text-white text-base font-bold mb-3">Thống kê</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-2xl p-4">
                                        <p className="text-slate-400 text-xs mb-1">Tổng số đề</p>
                                        <p className="text-cyan-400 text-2xl font-black">{stats.totalExamsTaken}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-4">
                                        <p className="text-slate-400 text-xs mb-1">Điểm TB</p>
                                        <p className={`text-2xl font-black ${getScoreColor(stats.averageScore)}`}>
                                            {stats.averageScore}%
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-4">
                                        <p className="text-slate-400 text-xs mb-1">Đã đạt</p>
                                        <p className="text-green-400 text-2xl font-black">{stats.passedExams}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-4">
                                        <p className="text-slate-400 text-xs mb-1">Chưa đạt</p>
                                        <p className="text-red-400 text-2xl font-black">{stats.failedExams}</p>
                                    </div>
                                </div>
                                {/* Progress bar */}
                                {stats.totalQuestions > 0 && (
                                    <div className="mt-3 bg-slate-800/50 border border-white/5 rounded-xl p-3">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-slate-400 text-xs">Tỷ lệ đúng</span>
                                            <span className="text-cyan-400 text-xs font-bold">
                                                {stats.totalCorrectAnswers}/{stats.totalQuestions} ({Math.round((stats.totalCorrectAnswers / stats.totalQuestions) * 100)}%)
                                            </span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
                                                style={{ width: `${(stats.totalCorrectAnswers / stats.totalQuestions) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* History List */}
                        <h2 className="text-white text-base font-bold mb-3">Lịch sử làm bài</h2>
                        {history.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3">
                                <span className="text-slate-500 text-4xl">📝</span>
                                <p className="text-slate-400 text-sm">Bạn chưa làm đề thi nào</p>
                                <button
                                    onClick={() => router.push("/exams")}
                                    className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                                >
                                    Làm đề ngay
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {history.map((result) => (
                                    <div
                                        key={result.id}
                                        className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-800/60"
                                        onClick={() => router.push(`/history/detail?id=${result.id}&examId=${result.exam.id}`)}
                                    >
                                        <div className="flex gap-3">
                                            {/* Score Badge */}
                                            <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex flex-col items-center justify-center ${result.passed ? "bg-green-500/20" : "bg-red-500/20"}`}>
                                                <span className={`text-lg font-black ${result.passed ? "text-green-400" : "text-red-400"}`}>
                                                    {result.score}%
                                                </span>
                                                <span className={`text-xs ${result.passed ? "text-green-400" : "text-red-400"}`}>
                                                    {result.passed ? "PASS" : "FAIL"}
                                                </span>
                                            </div>

                                            {/* Exam Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                                                    {result.exam.title}
                                                </h3>
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="text-slate-400 text-xs">
                                                        {result.exam.course.title}
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[result.exam.course.level] || "bg-slate-500/20 text-slate-400"}`}>
                                                        {result.exam.course.level}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-500 text-xs">
                                                    <span>✓ {result.correctCount}/{result.totalQuestions}</span>
                                                    <span>🕐 {formatDate(result.completedAt)}</span>
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <div className="flex items-center">
                                                <span className="text-slate-600">›</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-slate-700 transition-colors"
                                >
                                    ‹ Trước
                                </button>
                                <span className="px-4 py-2 text-slate-400 text-sm">
                                    {page}/{totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-slate-700 transition-colors"
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

export default HistoryPage;
