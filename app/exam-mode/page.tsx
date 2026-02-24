"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import { examService, Exam } from "@/services/exam";

/* ──────────── helpers ──────────── */
const providerMeta: Record<string, { icon: string; gradient: string }> = {
    AWS: { icon: "🔶", gradient: "from-orange-500 to-amber-400" },
    Azure: { icon: "🔷", gradient: "from-blue-500 to-cyan-400" },
    GCP: { icon: "🔴", gradient: "from-red-500 to-yellow-400" },
};

const levelMeta: Record<string, { label: string; badge: string }> = {
    Foundational: { label: "Foundational", badge: "border-green-500/30 bg-green-500/10 text-green-400" },
    Associate: { label: "Associate", badge: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
    Professional: { label: "Professional", badge: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
    Specialty: { label: "Specialty", badge: "border-pink-500/30 bg-pink-500/10 text-pink-400" },
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
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Spinner visible />
                <p className="text-slate-500 text-sm mt-4">Đang tải thông tin đề thi…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 gap-4">
                <span className="text-4xl">⚠️</span>
                <p className="text-red-400 text-sm font-medium">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm text-white hover:bg-slate-700 transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 gap-4">
                <span className="text-5xl">📝</span>
                <p className="text-slate-400 text-base font-medium">Không tìm thấy đề thi</p>
                <button
                    onClick={() => router.back()}
                    className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm text-white hover:bg-slate-700 transition-colors"
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
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30">
            {/* Background decorations */}
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-b from-cyan-600/10 to-transparent blur-3xl" />
                <div className="absolute bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/8 blur-3xl" />
                <div className="absolute bottom-40 right-0 h-48 w-48 rounded-full bg-orange-500/6 blur-3xl" />
            </div>

            {/* ═══════ HEADER ═══════ */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3 lg:px-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">←</span>
                        <span className="text-sm font-medium hidden sm:inline">Quay lại</span>
                    </button>

                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-cyan-400 blur-md opacity-40" />
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg">
                                <span className="text-base font-black text-white">C</span>
                            </div>
                        </div>
                        <span className="text-lg font-extrabold tracking-tight">
                            Cloud<span className="text-cyan-400">Exam</span>
                        </span>
                    </div>

                    <div className="w-9" /> {/* Spacer for layout balance */}
                </div>
            </header>

            {/* ═══════ CONTENT ═══════ */}
            <main className="relative z-10 mx-auto max-w-5xl px-5 lg:px-8 pt-10 pb-20">
                {/* ── Exam info card ── */}
                <div className="mb-10">
                    <div className="flex flex-col sm:flex-row items-start gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 relative overflow-hidden">
                        <div className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${prov.gradient} opacity-10 blur-3xl`} />

                        <div className={`flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${prov.gradient} opacity-90`}>
                            <span className="text-3xl">{prov.icon}</span>
                        </div>

                        <div className="relative z-10 flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-semibold text-slate-400">{providerName}</span>
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${lvl.badge}`}>
                                    {lvl.label}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-snug mb-2">
                                {exam.title}
                            </h1>
                            {exam.description && (
                                <p className="text-sm text-slate-400 leading-relaxed mb-3">{exam.description}</p>
                            )}
                            <div className="flex items-center gap-5 text-sm text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <span>🕐</span>
                                    <span className="font-semibold text-slate-300">{exam.durationMinutes} phút</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span>📋</span>
                                    <span className="font-semibold text-slate-300">{exam._count?.questions ?? exam.totalQuestions} câu hỏi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Section title ── */}
                <div className="text-center mb-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400 mb-2">Chọn chế độ</p>
                    <h2 className="text-2xl sm:text-3xl font-extrabold">
                        Bạn muốn <span className="text-cyan-400">luyện tập</span> hay <span className="text-amber-400">thi thử</span>?
                    </h2>
                </div>

                {/* ── Mode cards ── */}
                <div className="grid gap-5 sm:grid-cols-2 mb-12">
                    {/* Practice mode */}
                    <button
                        onClick={() => setSelectedMode("practice")}
                        className={`group relative text-left overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 ${selectedMode === "practice"
                            ? "border-cyan-500/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10"
                            : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.05]"
                            }`}
                    >
                        {/* Background glow */}
                        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 opacity-0 blur-3xl transition-opacity group-hover:opacity-15" />

                        {/* Selected indicator */}
                        {selectedMode === "practice" && (
                            <div className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500 text-white text-sm font-bold shadow-lg shadow-cyan-500/30">
                                ✓
                            </div>
                        )}

                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 mb-5">
                                <span className="text-3xl">📖</span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">Chế độ Luyện tập</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-5">
                                Thoải mái ôn tập, không giới hạn thời gian. Xem đáp án và giải thích ngay sau mỗi câu hỏi.
                            </p>

                            {/* Key features */}
                            <div className="space-y-2.5">
                                {[
                                    { icon: "∞", text: "Không giới hạn thời gian", color: "text-cyan-400" },
                                    { icon: "✅", text: "Xem đáp án ngay lập tức", color: "text-green-400" },
                                    { icon: "💡", text: "Giải thích chi tiết mỗi câu", color: "text-amber-400" },
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
                        className={`group relative text-left overflow-hidden rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 ${selectedMode === "test"
                            ? "border-amber-500/60 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                            : "border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.05]"
                            }`}
                    >
                        {/* Background glow */}
                        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 opacity-0 blur-3xl transition-opacity group-hover:opacity-15" />

                        {/* Selected indicator */}
                        {selectedMode === "test" && (
                            <div className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-500/30">
                                ✓
                            </div>
                        )}

                        <div className="relative z-10">
                            {/* Icon */}
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 mb-5">
                                <span className="text-3xl">🏆</span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">Chế độ Thi thử</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-5">
                                Mô phỏng kì thi thật với bộ đếm thời gian. Chỉ xem kết quả sau khi nộp bài hoặc hết giờ.
                            </p>

                            {/* Key features */}
                            <div className="space-y-2.5">
                                {[
                                    { icon: "⏱️", text: `Đếm ngược ${exam.durationMinutes} phút`, color: "text-amber-400" },
                                    { icon: "🔒", text: "Đáp án ẩn cho đến khi nộp", color: "text-orange-400" },
                                    { icon: "🎯", text: "Mô phỏng áp lực thi thật", color: "text-red-400" },
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
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden mb-10">
                    <div className="px-6 py-4 border-b border-white/[0.06]">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span className="text-cyan-400">📊</span>
                            So sánh chi tiết hai chế độ
                        </h3>
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-3 gap-4 px-6 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tính năng</div>
                        <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider text-center">📖 Luyện tập</div>
                        <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider text-center">🏆 Thi thử</div>
                    </div>

                    {/* Rows */}
                    {comparisonRows.map((row, idx) => (
                        <div
                            key={idx}
                            className={`grid grid-cols-3 gap-4 px-6 py-3.5 border-b border-white/[0.04] last:border-b-0 ${idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                                } hover:bg-white/[0.03] transition-colors`}
                        >
                            <div className="text-sm font-medium text-slate-300">{row.feature}</div>
                            <div className="text-center">
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                                    <span>{row.practiceIcon}</span>
                                    <span>{row.practice}</span>
                                </span>
                            </div>
                            <div className="text-center">
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
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
                        className={`w-full max-w-md h-14 rounded-2xl text-base font-bold transition-all duration-300 ${selectedMode === "practice"
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-600/25 hover:shadow-xl hover:shadow-cyan-600/30 hover:opacity-95"
                            : selectedMode === "test"
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-600/25 hover:shadow-xl hover:shadow-amber-600/30 hover:opacity-95"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed"
                            }`}
                    >
                        {!selectedMode
                            ? "Vui lòng chọn chế độ ở trên"
                            : selectedMode === "practice"
                                ? "📖 Bắt đầu Luyện tập"
                                : `🏆 Bắt đầu Thi thử (${exam.durationMinutes} phút)`}
                    </button>

                    {selectedMode && (
                        <p className="text-xs text-slate-500 animate-in fade-in duration-300">
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
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Spinner visible />
                <p className="text-slate-500 text-sm mt-4">Đang tải…</p>
            </div>
        }>
            <ExamModeContent />
        </Suspense>
    );
};

export default ExamModePage;
