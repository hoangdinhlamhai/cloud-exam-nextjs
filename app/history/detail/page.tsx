"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import { examResultService, ExamResultDetails } from "@/services/exam-result";
import { examService, Question } from "@/services/exam";

/* ──────────── helpers ──────────── */
const levelColors: Record<string, string> = {
    Practitioner: "border-green-500/25 bg-green-500/10 text-green-400",
    Associate: "border-blue-500/25 bg-blue-500/10 text-blue-400",
    Professional: "border-amber-500/25 bg-amber-500/10 text-amber-400",
    Expert: "border-pink-500/25 bg-pink-500/10 text-pink-400",
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
    const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
    const [filterMode, setFilterMode] = useState<"all" | "correct" | "wrong">("all");

    const questionRefs = useRef<Record<number, HTMLDivElement | null>>({});

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
            if (examData.questions.length > 0) {
                setActiveQuestionId(examData.questions[0].id);
            }
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

    const scrollToQuestion = (qId: number) => {
        setActiveQuestionId(qId);
        questionRefs.current[qId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    // Track active question on scroll
    useEffect(() => {
        if (questions.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const qId = parseInt(entry.target.getAttribute("data-qid") || "0");
                        if (qId) setActiveQuestionId(qId);
                    }
                }
            },
            { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
        );

        Object.values(questionRefs.current).forEach((el) => {
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [questions]);

    /* ── Guards ── */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Spinner visible size="lg" />
                <p className="text-slate-500 text-sm mt-4">Đang tải chi tiết kết quả…</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-3xl">⚠️</div>
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

    const getQuestionResult = (qId: number) => {
        const ua = result.userAnswers?.find(a => a.questionId === qId);
        if (!ua) return "unanswered";
        return ua.isCorrect ? "correct" : "wrong";
    };

    const correctCount = questions.filter(q => getQuestionResult(q.id) === "correct").length;
    const wrongCount = questions.filter(q => getQuestionResult(q.id) === "wrong").length;

    const filteredQuestions = questions.filter(q => {
        if (filterMode === "all") return true;
        if (filterMode === "correct") return getQuestionResult(q.id) === "correct";
        if (filterMode === "wrong") return getQuestionResult(q.id) === "wrong";
        return true;
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-b from-cyan-600/10 to-transparent blur-3xl" />
            </div>

            {/* ═══════ HEADER ═══════ */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06]">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push("/home")} className="flex items-center gap-2">
                            <span className="text-lg font-extrabold tracking-tight">
                                Cloud<span className="text-cyan-400">Exam</span>
                            </span>
                        </button>
                        <span className="text-slate-600">/</span>
                        <button onClick={() => router.push("/history")} className="text-sm text-slate-400 hover:text-white transition-colors">
                            Lịch sử
                        </button>
                        <span className="text-slate-600">/</span>
                        <span className="text-sm font-semibold text-slate-300 truncate max-w-[200px]">{result.exam.title}</span>
                    </div>
                    <button
                        onClick={() => router.push("/history")}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 rounded-xl border border-white/10 hover:bg-white/[0.06] hover:text-white transition-all"
                    >
                        ← Quay lại
                    </button>
                </div>
            </header>

            {/* ═══════ RESULT SUMMARY ═══════ */}
            <section className="relative overflow-hidden border-b border-white/[0.06]">
                <div className="pointer-events-none absolute inset-0">
                    <div className={`absolute -top-16 left-1/2 -translate-x-1/2 h-[300px] w-[500px] rounded-full blur-3xl ${result.passed ? "bg-green-600/10" : "bg-red-600/10"}`} />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Score + status */}
                        <div className={`flex items-center gap-6 rounded-2xl p-6 border flex-shrink-0 ${result.passed
                            ? "bg-green-500/10 border-green-500/20"
                            : "bg-red-500/10 border-red-500/20"
                            }`}>
                            <div className="text-center">
                                <span className={`text-5xl font-black ${result.passed ? "text-green-400" : "text-red-400"}`}>
                                    {result.score}%
                                </span>
                                <div className={`mt-1 text-xs font-bold px-3 py-1 rounded-full inline-block ${result.passed
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                    }`}>
                                    {result.passed ? "ĐẬU" : "RỚT"}
                                </div>
                            </div>
                            <div className="h-16 w-px bg-white/10" />
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-green-400">✓</span>
                                    <span className="text-slate-300">Đúng: <strong className="text-white">{result.correctCount}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-red-400">✕</span>
                                    <span className="text-slate-300">Sai: <strong className="text-white">{result.totalQuestions - result.correctCount}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-cyan-400">Σ</span>
                                    <span className="text-slate-300">Tổng: <strong className="text-white">{result.totalQuestions}</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Exam info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2 line-clamp-2">
                                {result.exam.title}
                            </h2>
                            <div className="flex items-center gap-3 flex-wrap mb-3">
                                <span className="text-lg">{prov.icon}</span>
                                <span className="text-sm text-slate-400">{result.exam.course?.title || "N/A"}</span>
                                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${levelColors[result.exam.course?.level || ""] || "bg-slate-500/15 text-slate-400 border-slate-500/25"}`}>
                                    {result.exam.course?.level || "N/A"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                🕐 Hoàn thành lúc {formatDate(result.completedAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ QUESTIONS SECTION ═══════ */}
            {questions.length > 0 && (
                <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 py-8">
                    <div className="flex gap-8">
                        {/* ── Sidebar: Question Navigator (desktop) ── */}
                        <aside className="hidden lg:block w-[240px] flex-shrink-0">
                            <div className="sticky top-[72px]">
                                <div className="bg-slate-900/60 border border-white/[0.06] rounded-2xl p-4">
                                    <h3 className="text-sm font-bold text-white mb-3">Danh sách câu hỏi</h3>

                                    {/* Filter buttons */}
                                    <div className="flex gap-1 mb-3">
                                        {([
                                            { key: "all", label: "Tất cả", count: questions.length },
                                            { key: "correct", label: "Đúng", count: correctCount },
                                            { key: "wrong", label: "Sai", count: wrongCount },
                                        ] as const).map((f) => (
                                            <button
                                                key={f.key}
                                                onClick={() => setFilterMode(f.key)}
                                                className={`flex-1 text-[10px] font-medium py-1.5 rounded-lg transition-all ${filterMode === f.key
                                                    ? f.key === "correct"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : f.key === "wrong"
                                                            ? "bg-red-500/20 text-red-400"
                                                            : "bg-cyan-500/20 text-cyan-400"
                                                    : "text-slate-500 hover:bg-white/[0.04]"
                                                    }`}
                                            >
                                                {f.label} ({f.count})
                                            </button>
                                        ))}
                                    </div>

                                    {/* Question dots grid */}
                                    <div className="grid grid-cols-5 gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
                                        {questions.map((q, idx) => {
                                            const qResult = getQuestionResult(q.id);
                                            const isActive = activeQuestionId === q.id;

                                            // Respect filter
                                            if (filterMode === "correct" && qResult !== "correct") return null;
                                            if (filterMode === "wrong" && qResult !== "wrong") return null;

                                            let dotBg = "bg-slate-800 text-slate-500";
                                            if (qResult === "correct") dotBg = "bg-green-500/20 text-green-400";
                                            else if (qResult === "wrong") dotBg = "bg-red-500/20 text-red-400";
                                            if (isActive) dotBg += " ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900";

                                            return (
                                                <button
                                                    key={q.id}
                                                    onClick={() => scrollToQuestion(q.id)}
                                                    className={`w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition-all hover:scale-110 ${dotBg}`}
                                                    title={`Câu ${idx + 1}`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Summary bar */}
                                    <div className="mt-4 pt-3 border-t border-white/[0.06]">
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                                            <div
                                                className="h-full bg-green-500 transition-all"
                                                style={{ width: `${(correctCount / questions.length) * 100}%` }}
                                            />
                                            <div
                                                className="h-full bg-red-500 transition-all"
                                                style={{ width: `${(wrongCount / questions.length) * 100}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[10px]">
                                            <span className="text-green-400">{correctCount} đúng</span>
                                            <span className="text-red-400">{wrongCount} sai</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* ── Main: All Questions List ── */}
                        <div className="flex-1 min-w-0">
                            {/* Mobile filter bar */}
                            <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-1">
                                {([
                                    { key: "all", label: `Tất cả (${questions.length})` },
                                    { key: "correct", label: `Đúng (${correctCount})` },
                                    { key: "wrong", label: `Sai (${wrongCount})` },
                                ] as const).map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilterMode(f.key)}
                                        className={`flex-shrink-0 text-xs font-medium px-4 py-2 rounded-xl border transition-all ${filterMode === f.key
                                            ? f.key === "correct"
                                                ? "bg-green-500/15 text-green-400 border-green-500/25"
                                                : f.key === "wrong"
                                                    ? "bg-red-500/15 text-red-400 border-red-500/25"
                                                    : "bg-cyan-500/15 text-cyan-400 border-cyan-500/25"
                                            : "text-slate-500 border-white/[0.06] hover:bg-white/[0.04]"
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Questions */}
                            <div className="space-y-6">
                                {filteredQuestions.map((question, filtIdx) => {
                                    const globalIdx = questions.findIndex(q => q.id === question.id);
                                    const qResult = getQuestionResult(question.id);
                                    const userAnswer = result.userAnswers?.find(ua => ua.questionId === question.id);

                                    return (
                                        <div
                                            key={question.id}
                                            ref={(el) => { questionRefs.current[question.id] = el; }}
                                            data-qid={question.id}
                                            className="group rounded-2xl border border-white/[0.06] bg-slate-900/50 overflow-hidden transition-all hover:border-white/[0.10]"
                                        >
                                            {/* Question header bar */}
                                            <div className={`flex items-center justify-between px-6 py-3 border-b ${qResult === "correct"
                                                ? "bg-green-500/5 border-green-500/15"
                                                : qResult === "wrong"
                                                    ? "bg-red-500/5 border-red-500/15"
                                                    : "bg-slate-800/30 border-white/[0.06]"
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${qResult === "correct"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : qResult === "wrong"
                                                            ? "bg-red-500/20 text-red-400"
                                                            : "bg-slate-700 text-slate-400"
                                                        }`}>
                                                        {globalIdx + 1}
                                                    </span>
                                                    <span className="text-sm font-semibold text-white">Câu {globalIdx + 1}</span>
                                                </div>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${qResult === "correct"
                                                    ? "bg-green-500/15 text-green-400"
                                                    : qResult === "wrong"
                                                        ? "bg-red-500/15 text-red-400"
                                                        : "bg-slate-700/50 text-slate-500"
                                                    }`}>
                                                    {qResult === "correct" ? "✓ Đúng" : qResult === "wrong" ? "✕ Sai" : "—"}
                                                </span>
                                            </div>

                                            {/* Question content */}
                                            <div className="p-6">
                                                <p className="text-sm sm:text-base text-white leading-relaxed whitespace-pre-wrap mb-5">
                                                    {question.content}
                                                </p>

                                                {/* Answer options */}
                                                <div className="space-y-2.5">
                                                    {question.answers.map((answer, aIdx) => {
                                                        const isCorrect = answer.isCorrect === true;
                                                        const isUserSelected = userAnswer?.answerId === answer.id;
                                                        const isUserWrong = isUserSelected && !isCorrect;

                                                        let borderStyle = "border-white/[0.06]";
                                                        let bgStyle = "bg-white/[0.02]";
                                                        let circleStyle = "bg-slate-700 text-slate-400";
                                                        let textStyle = "text-slate-300";
                                                        let icon = String.fromCharCode(65 + aIdx);

                                                        if (isCorrect) {
                                                            borderStyle = "border-green-500/30";
                                                            bgStyle = "bg-green-500/8";
                                                            circleStyle = "bg-green-500 text-white";
                                                            textStyle = "text-white";
                                                            icon = "✓";
                                                        } else if (isUserWrong) {
                                                            borderStyle = "border-red-500/30";
                                                            bgStyle = "bg-red-500/8";
                                                            circleStyle = "bg-red-500 text-white";
                                                            textStyle = "text-white";
                                                            icon = "✕";
                                                        }

                                                        return (
                                                            <div
                                                                key={answer.id}
                                                                className={`rounded-xl border ${borderStyle} ${bgStyle} p-4 transition-colors`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${circleStyle}`}>
                                                                        {icon}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className={`text-sm leading-relaxed ${textStyle}`}>
                                                                            {answer.content}
                                                                        </p>
                                                                        {isUserSelected && (
                                                                            <p className={`mt-1.5 text-xs font-medium ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                                                                                Bạn đã chọn
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Explanation */}
                                                {question.explanation && (
                                                    <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-blue-400">💡</span>
                                                            <p className="text-blue-400 font-bold text-sm">Giải thích</p>
                                                        </div>
                                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                                            {question.explanation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Empty filter state */}
                            {filteredQuestions.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <span className="text-4xl">🎉</span>
                                    <p className="text-slate-400 text-sm">
                                        {filterMode === "wrong" ? "Không có câu sai nào — tuyệt vời!" : "Không có kết quả"}
                                    </p>
                                </div>
                            )}

                            {/* Back to top / history */}
                            <div className="flex items-center justify-center gap-3 mt-10 mb-4">
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                    className="px-5 py-2.5 bg-slate-900/60 border border-white/[0.06] text-slate-400 text-sm rounded-xl hover:bg-slate-800 hover:text-white transition-all"
                                >
                                    ↑ Lên đầu trang
                                </button>
                                <button
                                    onClick={() => router.push("/history")}
                                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-cyan-600/20"
                                >
                                    ← Về lịch sử
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* No questions */}
            {questions.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900/80 border border-white/[0.06] text-4xl">📝</div>
                    <p className="text-slate-400 text-sm">Không có câu hỏi để xem lại</p>
                    <button
                        onClick={() => router.back()}
                        className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        Quay lại
                    </button>
                </div>
            )}
        </div>
    );
}

const HistoryDetailPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Spinner visible size="lg" />
                <p className="text-slate-500 text-sm mt-3">Đang tải…</p>
            </div>
        }>
            <HistoryDetailContent />
        </Suspense>
    );
};

export default HistoryDetailPage;
