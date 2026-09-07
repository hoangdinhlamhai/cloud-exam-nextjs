"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import { examService, Exam } from "@/services/exam";

/* ──────────── helpers ──────────── */
const providerMeta: Record<string, { icon: string; surface: string }> = {
    AWS: { icon: "🔶", surface: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50" },
    Azure: { icon: "🔷", surface: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50" },
    GCP: { icon: "🔴", surface: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50" },
};

const levelMeta: Record<string, { label: string; badge: string }> = {
    Practitioner: { label: "Practitioner", badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300" },
    Associate: { label: "Associate", badge: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300" },
    Professional: { label: "Professional", badge: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300" },
    Expert: { label: "Expert", badge: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300" },
};

/* ──────────── comparison data ──────────── */
interface ComparisonRow {
    feature: string;
    practice: string;
    test: string;
    practiceIcon: string;
    testIcon: string;
}

const comparisonRows: ComparisonRow[] = [
    {
        feature: "Bộ đếm thời gian",
        practice: "Không giới hạn",
        test: "Đếm ngược theo thời gian thi",
        practiceIcon: "∞",
        testIcon: "⏱️",
    },
    {
        feature: "Xem đáp án ngay",
        practice: "Xem ngay sau mỗi câu",
        test: "Chỉ xem sau khi nộp bài",
        practiceIcon: "✅",
        testIcon: "🔒",
    },
    {
        feature: "Giải thích chi tiết",
        practice: "Hiển thị ngay khi trả lời",
        test: "Hiển thị sau khi nộp bài",
        practiceIcon: "💡",
        testIcon: "📋",
    },
    {
        feature: "Áp lực thi cử",
        practice: "Không áp lực, thoải mái học",
        test: "Mô phỏng áp lực thi thật",
        practiceIcon: "😌",
        testIcon: "🎯",
    },
    {
        feature: "Ghi chú",
        practice: "Có thể ghi chú bất cứ lúc nào",
        test: "Có thể ghi chú bất cứ lúc nào",
        practiceIcon: "📝",
        testIcon: "📝",
    },
    {
        feature: "Nộp bài",
        practice: "Nộp bất cứ lúc nào",
        test: "Tự động nộp khi hết giờ",
        practiceIcon: "🟢",
        testIcon: "⚡",
    },
];

/* ──────────── component ──────────── */
function ExamModeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const examId = searchParams.get("id");

    const [exam, setExam] = useState<Exam | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMode, setSelectedMode] = useState<"practice" | "test" | null>(null);

    const fetchExam = useCallback(async () => {
        if (!examId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await examService.getById(parseInt(examId));
            setExam(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể tải đề thi");
        } finally {
            setIsLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        fetchExam();
    }, [fetchExam]);

    const handleStart = () => {
        if (!selectedMode || !examId) return;
        router.push(`/exam?id=${examId}&mode=${selectedMode}`);
    };

    /* ── guards ── */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-center">
                <Spinner visible />
                <p className="text-[var(--text-muted)] text-sm mt-4">Đang tải thông tin đề thi…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-center px-6 gap-4">
                <span className="text-4xl">⚠️</span>
                <p className="text-red-600 text-sm font-medium">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="secondary-action rounded-lg px-5 py-2.5 text-sm"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] flex flex-col items-center justify-center px-6 gap-4">
                <span className="text-5xl">📝</span>
                <p className="text-[var(--text-secondary)] text-base font-medium">Không tìm thấy đề thi</p>
                <button
                    onClick={() => router.back()}
                    className="secondary-action rounded-lg px-5 py-2.5 text-sm"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const providerName = exam.course?.title.includes("AWS") ? "AWS"
        : exam.course?.title.includes("Azure") ? "Azure"
            : exam.course?.title.includes("Google") ? "GCP" : "AWS";
    const prov = providerMeta[providerName] || providerMeta.AWS;
    const lvl = levelMeta[exam.course?.level] || levelMeta.Associate;

    return (
        <div className="app-shell min-h-screen text-[var(--text-primary)]">
            {/* ═══════ HEADER ═══════ */}
            <header className="site-header sticky top-0 z-50 shadow-sm">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 lg:px-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-clr)] bg-[var(--surface)]">←</span>
                        <span className="hidden text-sm font-medium sm:inline">Quay lại</span>
                    </button>

                    <div className="flex items-center gap-2.5">
                        <div className="brand-mark flex h-9 w-9 items-center justify-center rounded-lg">
                            <span className="text-base font-black">C</span>
                        </div>
                        <span className="wordmark text-lg font-extrabold tracking-tight">
                            Cloud<span className="wordmark-accent">Exam</span>
                        </span>
                    </div>

                    <div className="w-9" /> {/* Spacer for layout balance */}
                </div>
            </header>

            {/* ═══════ CONTENT ═══════ */}
            <main className="relative z-10 mx-auto max-w-5xl px-5 lg:px-8 pt-10 pb-20">
                {/* ── Exam info card ── */}
                <div className="mb-10">
                    <div className="surface-card flex flex-col items-start gap-5 rounded-xl p-6 sm:flex-row">
                        <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl border ${prov.surface}`}>
                            <span className="text-3xl">{prov.icon}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-center gap-2">
                                <span className="text-xs font-semibold text-[var(--text-muted)]">{providerName}</span>
                                <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${lvl.badge}`}>
                                    {lvl.label}
                                </span>
                            </div>
                            <h1 className="mb-2 text-xl font-extrabold leading-snug text-[var(--text-primary)] sm:text-2xl">
                                {exam.title}
                            </h1>
                            {exam.description && (
                                <p className="mb-3 text-sm leading-relaxed text-[var(--text-secondary)]">{exam.description}</p>
                            )}
                            <div className="flex items-center gap-5 text-sm text-[var(--text-muted)]">
                                <div className="flex items-center gap-1.5">
                                    <span>🕐</span>
                                    <span className="font-semibold text-[var(--text-secondary)]">{exam.durationMinutes} phút</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span>📋</span>
                                    <span className="font-semibold text-[var(--text-secondary)]">{exam._count?.questions ?? exam.totalQuestions} câu hỏi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section title ── */}
                <div className="mb-8 text-center">
                    <p className="app-eyebrow mb-2 text-xs font-semibold uppercase tracking-[0.18em]">Chọn chế độ</p>
                    <h2 className="text-2xl font-extrabold text-[var(--text-primary)] sm:text-3xl">
                        Bạn muốn luyện tập hay thi thử?
                    </h2>
                </div>

                {/* ── Mode cards ── */}
                <div className="grid gap-5 sm:grid-cols-2 mb-12">
                    {/* Practice mode */}
                    <button
                        onClick={() => setSelectedMode("practice")}
                        className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-colors ${selectedMode === "practice"
                            ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/50"
                            : "border-[var(--border-clr)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
                            }`}
                    >
                        {/* Selected indicator */}
                        {selectedMode === "practice" && (
                            <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                ✓
                            </div>
                        )}

                        <div>
                            {/* Icon */}
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/50">
                                <span className="text-3xl">📖</span>
                            </div>

                            <h3 className="mb-2 text-xl font-bold text-[var(--text-primary)]">Chế độ Luyện tập</h3>
                            <p className="mb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                                Thoải mái ôn tập, không giới hạn thời gian. Xem đáp án và giải thích ngay sau mỗi câu hỏi.
                            </p>

                            {/* Key features */}
                            <div className="space-y-2.5">
                                {[
                                    { icon: "∞", text: "Không giới hạn thời gian", color: "text-blue-700 dark:text-blue-300" },
                                    { icon: "✅", text: "Xem đáp án ngay lập tức", color: "text-green-700 dark:text-green-300" },
                                    { icon: "💡", text: "Giải thích chi tiết mỗi câu", color: "text-amber-700 dark:text-amber-300" },
                                ].map((f, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <span className="text-sm">{f.icon}</span>
                                        <span className={`text-sm font-medium ${f.color}`}>{f.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </button>

                    {/* Test mode */}
                    <button
                        onClick={() => setSelectedMode("test")}
                        className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-colors ${selectedMode === "test"
                            ? "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/50"
                            : "border-[var(--border-clr)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)]"
                            }`}
                    >
                        {/* Selected indicator */}
                        {selectedMode === "test" && (
                            <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                ✓
                            </div>
                        )}

                        <div>
                            {/* Icon */}
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                <span className="text-3xl">🏆</span>
                            </div>

                            <h3 className="mb-2 text-xl font-bold text-[var(--text-primary)]">Chế độ Thi thử</h3>
                            <p className="mb-5 text-sm leading-relaxed text-[var(--text-secondary)]">
                                Mô phỏng kì thi thật với bộ đếm thời gian. Chỉ xem kết quả sau khi nộp bài hoặc hết giờ.
                            </p>

                            {/* Key features */}
                            <div className="space-y-2.5">
                                {[
                                    { icon: "⏱️", text: `Đếm ngược ${exam.durationMinutes} phút`, color: "text-amber-700 dark:text-amber-300" },
                                    { icon: "🔒", text: "Đáp án ẩn cho đến khi nộp", color: "text-slate-700 dark:text-slate-300" },
                                    { icon: "🎯", text: "Mô phỏng áp lực thi thật", color: "text-red-700 dark:text-red-300" },
                                ].map((f, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <span className="text-sm">{f.icon}</span>
                                        <span className={`text-sm font-medium ${f.color}`}>{f.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </button>
                </div>

                {/* ── Comparison table ── */}
                <div className="surface-card mb-10 overflow-hidden rounded-xl">
                    <div className="border-b border-[var(--border-clr)] px-6 py-4">
                        <h3 className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
                            <span className="text-blue-600">📊</span>
                            So sánh chi tiết hai chế độ
                        </h3>
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-3 gap-4 border-b border-[var(--border-clr)] bg-slate-50 px-6 py-3 dark:bg-slate-800">
                        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Tính năng</div>
                        <div className="text-center text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">📖 Luyện tập</div>
                        <div className="text-center text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">🏆 Thi thử</div>
                    </div>

                    {/* Rows */}
                    {comparisonRows.map((row, idx) => (
                        <div
                            key={idx}
                            className={`grid grid-cols-3 gap-4 border-b border-[var(--border-clr)] px-6 py-3.5 last:border-b-0 ${idx % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/70 dark:bg-slate-800/70"
                                } transition-colors hover:bg-slate-50 dark:hover:bg-slate-800`}
                        >
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-100">{row.feature}</div>
                            <div className="text-center">
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                    <span>{row.practiceIcon}</span>
                                    <span>{row.practice}</span>
                                </span>
                            </div>
                            <div className="text-center">
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                    <span>{row.testIcon}</span>
                                    <span>{row.test}</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Start button ── */}
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={handleStart}
                        disabled={!selectedMode}
                        className={`h-14 w-full max-w-md rounded-lg text-base font-bold transition-colors ${selectedMode
                            ? "primary-action"
                            : "cursor-not-allowed border border-slate-200 bg-slate-200 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                    >
                        {!selectedMode
                            ? "Vui lòng chọn chế độ ở trên"
                            : selectedMode === "practice"
                                ? "📖 Bắt đầu Luyện tập"
                                : `🏆 Bắt đầu Thi thử (${exam.durationMinutes} phút)`}
                    </button>

                    {selectedMode && (
                        <p className="text-xs text-[var(--text-muted)] animate-in fade-in duration-300">
                            {selectedMode === "practice"
                                ? "Bạn có thể xem đáp án ngay sau mỗi câu hỏi"
                                : `Bộ đếm thời gian ${exam.durationMinutes} phút sẽ bắt đầu ngay khi vào trang thi`}
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}

/* ──────────── page wrapper ──────────── */
const ExamModePage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center">
                <Spinner visible />
                <p className="text-[var(--text-muted)] text-sm mt-4">Đang tải…</p>
            </div>
        }>
            <ExamModeContent />
        </Suspense>
    );
};

export default ExamModePage;
