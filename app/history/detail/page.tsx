"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import { examResultService, ExamResultDetails } from "@/services/exam-result";
import { examService, ExamWithQuestions, Question } from "@/services/exam";

/* ──────────── helpers ──────────── */
const levelColors: Record<string, string> = {
    Practitioner: "border-green-500/30 bg-green-500/10 text-green-400",
    Associate: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    Professional: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    Expert: "border-pink-500/30 bg-pink-500/10 text-pink-400",
};

const providerMeta: Record<string, { icon: string; gradient: string }> = {
    AWS: { icon: "🔶", gradient: "from-orange-500 to-amber-400" },
    Azure: { icon: "🔷", gradient: "from-blue-500 to-cyan-400" },
    GCP: { icon: "🔴", gradient: "from-red-500 to-yellow-400" },
};

function HistoryDetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resultId = searchParams.get("id");
    const examId = searchParams.get("examId");

    const [result, setResult] = useState<ExamResultDetails | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const fetchData = useCallback(async () => {
        if (!resultId || !examId) return;
        setIsLoading(true);
        setError(null);
        try {
            const [resultData, examData] = await Promise.all([
                examResultService.getResultById(parseInt(resultId)),
                examService.reviewExam(parseInt(examId)),
            ]);
            setResult(resultData);
            setQuestions(examData.questions);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể tải chi tiết");
        } finally {
            setIsLoading(false);
        }
    }, [resultId, examId]);

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

    const currentQuestion = questions[currentIndex];

    /* ── guards ── */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Spinner visible />
                <p className="text-slate-500 text-sm mt-4">Đang tải chi tiết kết quả…</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 gap-4">
                <span className="text-4xl">⚠️</span>
                <p className="text-red-400 text-sm font-medium">{error || "Không tìm thấy kết quả"}</p>
                <button
                    onClick={() => router.back()}
                    className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm text-white hover:bg-slate-700 transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const providerName = result.exam?.course?.title?.includes("AWS") ? "AWS"
        : result.exam?.course?.title?.includes("Azure") ? "Azure"
            : result.exam?.course?.title?.includes("Google") ? "GCP" : "AWS";
    const prov = providerMeta[providerName] || providerMeta.AWS;

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
            {/* Background decorations */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-b from-cyan-600/10 to-transparent blur-3xl" />
            </div>

            {/* ═══════ HEADER ═══════ */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 lg:px-8">
                    <button
                        onClick={() => router.push("/history")}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">←</span>
                        <span className="text-sm font-medium hidden sm:inline">Lịch sử</span>
                    </button>

                    <div className="flex-1 min-w-0 mx-4 text-center">
                        <h1 className="text-sm font-bold truncate">{result.exam.title}</h1>
                        <p className="text-xs text-slate-500">{formatDate(result.completedAt)}</p>
                    </div>

                    <div className="w-9" />
                </div>
            </header>

            {/* ═══════ CONTENT ═══════ */}
            <main className="relative z-10 mx-auto max-w-5xl px-5 lg:px-8 pt-8 pb-32">
                {/* ── Result Summary Card ── */}
                <div className={`rounded-2xl p-6 mb-8 border ${result.passed
                    ? "bg-green-500/10 border-green-500/20"
                    : "bg-red-500/10 border-red-500/20"
                    }`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Kết quả</p>
                            <div className="flex items-center gap-3">
                                <span className={`text-4xl font-black ${result.passed ? "text-green-400" : "text-red-400"}`}>
                                    {result.score}%
                                </span>
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${result.passed
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                    }`}>
                                    {result.passed ? "ĐẬU" : "RỚT"}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 mb-1">Số câu đúng</p>
                            <p className="text-2xl font-bold text-white">
                                {result.correctCount}/{result.totalQuestions}
                            </p>
                        </div>
                    </div>

                    {/* Course info */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                        <span className="text-lg">{prov.icon}</span>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${levelColors[result.exam.course?.level || ""] || "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}>
                            {result.exam.course?.level || "N/A"}
                        </span>
                        <span className="text-xs text-slate-400">{result.exam.course?.title || "N/A"}</span>
                    </div>
                </div>

                {/* ── Questions Review ── */}
                {questions.length > 0 && (
                    <>
                        {/* Progress bar */}
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-slate-300">Xem lại câu hỏi</p>
                                <p className="text-xs text-slate-500">
                                    Câu <span className="text-cyan-400 font-bold">{currentIndex + 1}</span> / {questions.length}
                                </p>
                            </div>
                            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question content */}
                        {currentQuestion && (
                            <div className="space-y-5">
                                {/* Question text */}
                                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6">
                                    <p className="text-base text-white leading-relaxed whitespace-pre-wrap">
                                        {currentQuestion.content}
                                    </p>
                                </div>

                                {/* Answer options */}
                                <div className="space-y-3">
                                    {currentQuestion.answers.map((answer, idx) => {
                                        const isCorrect = answer.isCorrect === true;
                                        const userAnswer = result.userAnswers?.find(
                                            ua => ua.questionId === currentQuestion.id
                                        );
                                        const isUserSelected = userAnswer?.answerId === answer.id;
                                        const isUserWrong = isUserSelected && !isCorrect;

                                        let borderColor = "border-white/[0.06]";
                                        let bgColor = "bg-white/[0.02]";
                                        let circleColor = "bg-slate-700 text-slate-400";
                                        let textColor = "text-slate-300";
                                        let icon = "";

                                        if (isCorrect) {
                                            borderColor = "border-green-500/40";
                                            bgColor = "bg-green-500/10";
                                            circleColor = "bg-green-500 text-white";
                                            textColor = "text-white";
                                            icon = "✓";
                                        } else if (isUserWrong) {
                                            borderColor = "border-red-500/40";
                                            bgColor = "bg-red-500/10";
                                            circleColor = "bg-red-500 text-white";
                                            textColor = "text-white";
                                            icon = "✕";
                                        }

                                        return (
                                            <div
                                                key={answer.id}
                                                className={`rounded-xl border ${borderColor} ${bgColor} p-4 transition-colors`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${circleColor}`}>
                                                        {icon || String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <p className={`flex-1 text-sm leading-relaxed pt-1 ${textColor}`}>
                                                        {answer.content}
                                                    </p>
                                                </div>
                                                {isUserSelected && (
                                                    <p className={`mt-2 ml-11 text-xs font-medium ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                                                        ← Bạn đã chọn
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Explanation */}
                                {currentQuestion.explanation && (
                                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-blue-400">💡</span>
                                            <p className="text-blue-400 font-bold text-sm">Giải thích</p>
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                            {currentQuestion.explanation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Question navigator dots */}
                        <div className="flex justify-center gap-1.5 mt-8 flex-wrap">
                            {questions.map((q, idx) => {
                                const userAns = result.userAnswers?.find(ua => ua.questionId === q.id);
                                const isAnsweredCorrectly = userAns?.isCorrect;
                                const isCurrent = idx === currentIndex;

                                let dotColor = "bg-slate-700";
                                if (isAnsweredCorrectly === true) dotColor = "bg-green-500";
                                else if (isAnsweredCorrectly === false) dotColor = "bg-red-500";
                                if (isCurrent) dotColor += " ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-950";

                                return (
                                    <button
                                        key={q.id}
                                        className={`w-3 h-3 rounded-full transition-all ${dotColor} hover:opacity-80`}
                                        onClick={() => setCurrentIndex(idx)}
                                        title={`Câu ${idx + 1}`}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}

                {/* No questions */}
                {questions.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <span className="text-5xl">📝</span>
                        <p className="text-slate-400 text-sm">Không có câu hỏi để xem lại</p>
                        <button
                            onClick={() => router.back()}
                            className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm text-white font-medium hover:opacity-90 transition-opacity"
                        >
                            Quay lại
                        </button>
                    </div>
                )}
            </main>

            {/* ═══════ FIXED BOTTOM NAVIGATION ═══════ */}
            {questions.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-white/[0.06]">
                    <div className="mx-auto max-w-5xl px-5 lg:px-8 py-4 flex gap-3">
                        <button
                            className="flex-1 h-12 rounded-xl border border-white/10 bg-white/[0.04] text-white font-medium text-sm disabled:opacity-40 flex items-center justify-center gap-1.5 hover:bg-white/[0.08] transition-colors"
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        >
                            ← Trước
                        </button>

                        {currentIndex === questions.length - 1 ? (
                            <button
                                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold text-sm flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20"
                                onClick={() => router.push("/history")}
                            >
                                ✓ Hoàn thành
                            </button>
                        ) : (
                            <button
                                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-medium text-sm flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
                                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            >
                                Tiếp →
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const HistoryDetailPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Spinner visible />
                <p className="text-slate-500 text-sm mt-3">Đang tải…</p>
            </div>
        }>
            <HistoryDetailContent />
        </Suspense>
    );
};

export default HistoryDetailPage;
