"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import { examResultService, ExamResultDetails } from "@/services/exam-result";
import { examService, Question } from "@/services/exam";

/* ──────────── helpers ──────────── */
const levelColors: Record<string, string> = {
    Practitioner: "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300",
    Associate: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
    Professional: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
    Expert: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
};

const providerMeta: Record<string, { icon: string }> = {
    AWS: { icon: "🔶" },
    Azure: { icon: "🔷" },
    GCP: { icon: "🔴" },
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
            <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)]">
                <Spinner visible size="lg" />
                <p className="mt-4 text-sm text-[var(--text-muted)]">Đang tải chi tiết kết quả…</p>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--background)] px-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-3xl dark:border-red-800 dark:bg-red-950/50">⚠️</div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{error || "Không tìm thấy kết quả"}</p>
                <button
                    onClick={() => router.back()}
                    className="secondary-action rounded-lg px-5 py-2.5 text-sm"
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
        <div className="app-shell min-h-screen selection:bg-blue-100">
            {/* ═══════ HEADER ═══════ */}
            <header className="site-header sticky top-0 z-50 shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        <button onClick={() => router.push("/home")} className="flex items-center gap-2">
                            <span className="wordmark text-lg font-extrabold tracking-tight">
                                Cloud<span className="wordmark-accent">Exam</span>
                            </span>
                        </button>
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        <button onClick={() => router.push("/history")} className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                            Lịch sử
                        </button>
                        <span className="text-slate-300 dark:text-slate-600">/</span>
                        <span className="max-w-[200px] truncate text-sm font-semibold text-slate-700 dark:text-slate-300">{result.exam.title}</span>
                    </div>
                    <button
                        onClick={() => router.push("/history")}
                        className="secondary-action flex items-center gap-2 rounded-lg px-4 py-2 text-sm"
                    >
                        ← Quay lại
                    </button>
                </div>
            </header>

            {/* ═══════ RESULT SUMMARY ═══════ */}
            <section className="border-b border-[var(--border-clr)] bg-white dark:bg-slate-950">
                <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
                        {/* Score + status */}
                        <div className={`flex flex-shrink-0 items-center gap-6 rounded-xl border p-6 shadow-sm ${result.passed
                            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/50"
                            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50"
                            }`}>
                            <div className="text-center">
                                <span className={`text-5xl font-black ${result.passed ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                                    {result.score}%
                                </span>
                                <div className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${result.passed
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/70 dark:text-green-200"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-200"
                                    }`}>
                                    {result.passed ? "ĐẬU" : "RỚT"}
                                </div>
                            </div>
                            <div className="h-16 w-px bg-slate-200 dark:bg-slate-700" />
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-green-600">✓</span>
                                    <span className="text-slate-600 dark:text-slate-300">Đúng: <strong className="text-slate-900 dark:text-slate-100">{result.correctCount}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-red-600">✕</span>
                                    <span className="text-slate-600 dark:text-slate-300">Sai: <strong className="text-slate-900 dark:text-slate-100">{result.totalQuestions - result.correctCount}</strong></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-blue-600">Σ</span>
                                    <span className="text-slate-600 dark:text-slate-300">Tổng: <strong className="text-slate-900 dark:text-slate-100">{result.totalQuestions}</strong></span>
                                </div>
                            </div>
                        </div>

                        {/* Exam info */}
                        <div className="min-w-0 flex-1">
                            <h2 className="mb-2 line-clamp-2 text-xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-2xl">
                                {result.exam.title}
                            </h2>
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                                <span className="text-lg">{prov.icon}</span>
                                <span className="text-sm text-slate-600 dark:text-slate-300">{result.exam.course?.title || "N/A"}</span>
                                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${levelColors[result.exam.course?.level || ""] || "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                                    {result.exam.course?.level || "N/A"}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
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
                                <div className="surface-card rounded-xl p-4">
                                    <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-100">Danh sách câu hỏi</h3>

                                    {/* Filter buttons */}
                                    <div className="mb-3 flex gap-1">
                                        {([
                                            { key: "all", label: "Tất cả", count: questions.length },
                                            { key: "correct", label: "Đúng", count: correctCount },
                                            { key: "wrong", label: "Sai", count: wrongCount },
                                        ] as const).map((f) => (
                                            <button
                                                key={f.key}
                                                onClick={() => setFilterMode(f.key)}
                                                className={`flex-1 rounded-lg py-1.5 text-[10px] font-medium transition-colors ${filterMode === f.key
                                                    ? f.key === "correct"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/70 dark:text-green-200"
                                                        : f.key === "wrong"
                                                            ? "bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-200"
                                                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/70 dark:text-blue-200"
                                                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
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

                                            let dotBg = "border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
                                            if (qResult === "correct") dotBg = "border border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300";
                                            else if (qResult === "wrong") dotBg = "border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300";
                                            if (isActive) dotBg += " ring-2 ring-blue-200 ring-offset-1 ring-offset-white dark:ring-blue-700 dark:ring-offset-slate-900";

                                            return (
                                                <button
                                                    key={q.id}
                                                    onClick={() => scrollToQuestion(q.id)}
                                                    className={`flex aspect-square w-full items-center justify-center rounded-lg text-[10px] font-bold transition-colors hover:border-slate-400 dark:hover:border-slate-500 ${dotBg}`}
                                                    title={`Câu ${idx + 1}`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Summary bar */}
                                    <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
                                        <div className="flex h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                            <div
                                                className="h-full bg-green-600 transition-all"
                                                style={{ width: `${(correctCount / questions.length) * 100}%` }}
                                            />
                                            <div
                                                className="h-full bg-red-600 transition-all"
                                                style={{ width: `${(wrongCount / questions.length) * 100}%` }}
                                            />
                                        </div>
                                        <div className="mt-2 flex justify-between text-[10px]">
                                            <span className="text-green-700 dark:text-green-300">{correctCount} đúng</span>
                                            <span className="text-red-700 dark:text-red-300">{wrongCount} sai</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* ── Main: All Questions List ── */}
                        <div className="flex-1 min-w-0">
                            {/* Mobile filter bar */}
                            <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                                {([
                                    { key: "all", label: `Tất cả (${questions.length})` },
                                    { key: "correct", label: `Đúng (${correctCount})` },
                                    { key: "wrong", label: `Sai (${wrongCount})` },
                                ] as const).map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setFilterMode(f.key)}
                                        className={`flex-shrink-0 rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${filterMode === f.key
                                            ? f.key === "correct"
                                                ? "border-green-200 bg-green-50 text-green-700"
                                                : f.key === "wrong"
                                                    ? "border-red-200 bg-red-50 text-red-700"
                                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
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
                                            className="surface-card group overflow-hidden rounded-xl transition-colors hover:border-slate-300"
                                        >
                                            {/* Question header bar */}
                                            <div className={`flex items-center justify-between border-b px-6 py-3 ${qResult === "correct"
                                                ? "border-green-200 bg-green-50"
                                                : qResult === "wrong"
                                                    ? "border-red-200 bg-red-50"
                                                    : "border-slate-200 bg-slate-50"
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${qResult === "correct"
                                                        ? "bg-green-100 text-green-700"
                                                        : qResult === "wrong"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-slate-200 text-slate-600"
                                                        }`}>
                                                        {globalIdx + 1}
                                                    </span>
                                                    <span className="text-sm font-semibold text-slate-900">Câu {globalIdx + 1}</span>
                                                </div>
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${qResult === "correct"
                                                    ? "bg-green-100 text-green-700"
                                                    : qResult === "wrong"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-slate-200 text-slate-500"
                                                    }`}>
                                                    {qResult === "correct" ? "✓ Đúng" : qResult === "wrong" ? "✕ Sai" : "—"}
                                                </span>
                                            </div>

                                            {/* Question content */}
                                            <div className="p-6">
                                                <p className="mb-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-900 sm:text-base">
                                                    {question.content}
                                                </p>

                                                {/* Answer options */}
                                                <div className="space-y-2.5">
                                                    {question.answers.map((answer, aIdx) => {
                                                        const isCorrect = answer.isCorrect === true;
                                                        const isUserSelected = userAnswer?.answerId === answer.id;
                                                        const isUserWrong = isUserSelected && !isCorrect;

                                                        let borderStyle = "border-slate-200";
                                                        let bgStyle = "bg-white";
                                                        let circleStyle = "bg-slate-100 text-slate-600";
                                                        let textStyle = "text-slate-700";
                                                        let icon = String.fromCharCode(65 + aIdx);

                                                        if (isCorrect) {
                                                            borderStyle = "border-green-300";
                                                            bgStyle = "bg-green-50";
                                                            circleStyle = "bg-green-600 text-white";
                                                            textStyle = "text-green-900";
                                                            icon = "✓";
                                                        } else if (isUserWrong) {
                                                            borderStyle = "border-red-300";
                                                            bgStyle = "bg-red-50";
                                                            circleStyle = "bg-red-600 text-white";
                                                            textStyle = "text-red-900";
                                                            icon = "✕";
                                                        }

                                                        return (
                                                            <div
                                                                key={answer.id}
                                                                className={`rounded-lg border ${borderStyle} ${bgStyle} p-4 transition-colors`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${circleStyle}`}>
                                                                        {icon}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className={`text-sm leading-relaxed ${textStyle}`}>
                                                                            {answer.content}
                                                                        </p>
                                                                        {isUserSelected && (
                                                                            <p className={`mt-1.5 text-xs font-medium ${isCorrect ? "text-green-700" : "text-red-700"}`}>
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
                                                    <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-5">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <span className="text-blue-600">💡</span>
                                                            <p className="text-sm font-bold text-blue-700">Giải thích</p>
                                                        </div>
                                                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
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
                                <div className="flex flex-col items-center justify-center gap-3 py-16">
                                    <span className="text-4xl">🎉</span>
                                    <p className="text-sm text-slate-600">
                                        {filterMode === "wrong" ? "Không có câu sai nào — tuyệt vời!" : "Không có kết quả"}
                                    </p>
                                </div>
                            )}

                            {/* Back to top / history */}
                            <div className="mb-4 mt-10 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                    className="secondary-action rounded-lg px-5 py-2.5 text-sm"
                                >
                                    ↑ Lên đầu trang
                                </button>
                                <button
                                    onClick={() => router.push("/history")}
                                    className="primary-action rounded-lg px-5 py-2.5 text-sm font-bold"
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
                <div className="flex flex-col items-center justify-center gap-4 py-20">
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-slate-200 bg-white text-4xl shadow-sm">📝</div>
                    <p className="text-sm text-slate-600">Không có câu hỏi để xem lại</p>
                    <button
                        onClick={() => router.back()}
                        className="secondary-action rounded-lg px-5 py-2.5 text-sm font-medium"
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
            <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)]">
                <Spinner visible size="lg" />
                <p className="mt-3 text-sm text-[var(--text-muted)]">Đang tải…</p>
            </div>
        }>
            <HistoryDetailContent />
        </Suspense>
    );
};

export default HistoryDetailPage;
