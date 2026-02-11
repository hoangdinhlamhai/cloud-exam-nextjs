"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import { useSnackbar } from "@/components/Snackbar";
import { examService, Exam } from "@/services/exam";
import { questionService, Question } from "@/services/question";
import { examResultService, QuestionResult } from "@/services/exam-result";
import { noteService } from "@/services/note";
import { getAuthToken } from "@/lib/api";

/* ──────────── types ──────────── */
type UserAnswers = Record<number, number>;
type AnswerResults = Record<number, QuestionResult>;
type QuestionNotes = Record<number, string>;

/* ──────────── main content ──────────── */
function ExamContent() {
    const router = useRouter();
    const { openSnackbar } = useSnackbar();
    const searchParams = useSearchParams();
    const examId = searchParams.get("id");

    /* ── state ── */
    const [exam, setExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [answerResults, setAnswerResults] = useState<AnswerResults>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Question grid drawer
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Notes
    const [questionNotes, setQuestionNotes] = useState<QuestionNotes>({});
    const [openNoteId, setOpenNoteId] = useState<number | null>(null);
    const [isSavingNote, setIsSavingNote] = useState(false);

    /* ── fetch ── */
    const fetchExamData = useCallback(async () => {
        if (!examId) return;
        setIsLoading(true);
        setError(null);
        try {
            const examData = await examService.getById(parseInt(examId));
            setExam(examData);
            const questionsData = await questionService.getByExam(parseInt(examId), false);
            setQuestions(questionsData);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể tải đề thi");
        } finally {
            setIsLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        fetchExamData();
    }, [fetchExamData]);

    /* ── handlers ── */
    const handleSelectAnswer = (questionId: number, answerId: number) => {
        if (isSubmitted) return;
        setUserAnswers((prev) => ({ ...prev, [questionId]: answerId }));
    };

    const handleSubmit = async () => {
        const answeredCount = Object.keys(userAnswers).length;
        if (answeredCount < questions.length) {
            openSnackbar({
                text: `Bạn còn ${questions.length - answeredCount} câu chưa trả lời!`,
                type: "warning",
                duration: 3000,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const token = getAuthToken();

            if (token && examId) {
                const answers = Object.entries(userAnswers).map(([qId, aId]) => ({
                    questionId: parseInt(qId),
                    answerId: aId,
                }));

                const submissionResult = await examResultService.submitExam({
                    examId: parseInt(examId),
                    answers,
                });

                const results: AnswerResults = {};
                submissionResult.details.forEach((detail) => {
                    results[detail.questionId] = detail;
                });
                setAnswerResults(results);

                openSnackbar({
                    text: `Điểm: ${submissionResult.score}% (${submissionResult.correctCount}/${submissionResult.totalQuestions})`,
                    type: submissionResult.score >= 70 ? "success" : "warning",
                    duration: 5000,
                });
            } else {
                const results: AnswerResults = {};
                for (const question of questions) {
                    const answerId = userAnswers[question.id];
                    if (answerId) {
                        const result = await questionService.checkAnswer(question.id, answerId);
                        results[question.id] = {
                            questionId: question.id,
                            isCorrect: result.isCorrect,
                            userAnswerId: answerId,
                            correctAnswerId: result.correctAnswerId,
                            explanation: result.explanation,
                        };
                    }
                }
                setAnswerResults(results);
                openSnackbar({
                    text: "Kết quả không được lưu. Đăng nhập để theo dõi tiến độ!",
                    type: "info",
                    duration: 4000,
                });
            }

            setIsSubmitted(true);
        } catch (err: unknown) {
            openSnackbar({
                text: err instanceof Error ? err.message : "Không thể nộp bài",
                type: "error",
                duration: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        Object.values(answerResults).forEach((r) => { if (r.isCorrect) correct++; });
        const total = questions.length;
        return { correct, total, percent: total > 0 ? Math.round((correct / total) * 100) : 0 };
    };

    /* ── note handlers ── */
    const handleSaveNote = async (questionId: number) => {
        const content = questionNotes[questionId];
        if (!content?.trim()) return;

        const token = getAuthToken();
        if (!token) {
            openSnackbar({ text: "Đăng nhập để lưu ghi chú", type: "warning", duration: 3000 });
            return;
        }

        setIsSavingNote(true);
        try {
            await noteService.createNote({ questionId, content: content.trim() });
            openSnackbar({ text: "Đã lưu ghi chú", type: "success", duration: 2000 });
            setOpenNoteId(null);
        } catch (err: unknown) {
            openSnackbar({
                text: err instanceof Error ? err.message : "Không thể lưu ghi chú",
                type: "error",
                duration: 3000,
            });
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleDeleteNote = (questionId: number) => {
        setQuestionNotes((prev) => {
            const next = { ...prev };
            delete next[questionId];
            return next;
        });
        openSnackbar({ text: "Đã xóa ghi chú", type: "success", duration: 2000 });
    };

    /* ── derived ── */
    const currentQuestion = questions[currentIndex];
    const score = isSubmitted ? calculateScore() : null;
    const answeredCount = Object.keys(userAnswers).length;

    /* ── guards ── */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Spinner visible />
                <p className="text-slate-500 text-sm mt-4">Đang tải đề thi…</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 gap-4">
                <span className="text-4xl">⚠️</span>
                <p className="text-red-400 text-sm font-medium">{error}</p>
                <button onClick={() => router.back()} className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm text-white hover:bg-slate-700 transition-colors">
                    Quay lại
                </button>
            </div>
        );
    }
    if (!exam || questions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 gap-4">
                <span className="text-5xl">📝</span>
                <p className="text-slate-400 text-base font-medium">{!exam ? `Không tìm thấy đề thi (ID: ${examId})` : `Chưa có câu hỏi trong đề thi "${exam.title}"`}</p>
                <button onClick={() => router.back()} className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm text-white hover:bg-slate-700 transition-colors">
                    Quay lại
                </button>
            </div>
        );
    }

    /* ──────── RENDER ──────── */
    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 flex flex-col relative">
            {/* ── Background decorations ── */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-24 right-0 h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-3xl" />
                <div className="absolute bottom-40 -left-20 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            {/* ══════════════ HEADER ══════════════ */}
            <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20">
                <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3 lg:px-8">
                    {/* Close */}
                    <button
                        onClick={() => router.back()}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08] transition-colors flex-shrink-0"
                    >
                        ✕
                    </button>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-bold text-white truncate">{exam.title}</h1>
                        <p className="text-xs text-slate-500">
                            Câu {currentIndex + 1}/{questions.length}
                            {!isSubmitted && <span className="ml-2 text-cyan-400">· {answeredCount} đã trả lời</span>}
                        </p>
                    </div>

                    {/* Score badge (after submit) */}
                    {isSubmitted && score && (
                        <div className={`px-3.5 py-1.5 rounded-full text-sm font-bold ${score.percent >= 70 ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"}`}>
                            {score.correct}/{score.total} ({score.percent}%)
                        </div>
                    )}

                    {/* Grid button */}
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="flex h-9 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-slate-300 hover:bg-white/[0.08] transition-colors flex-shrink-0"
                    >
                        <span className="text-cyan-400">▦</span>
                        <span className="hidden sm:inline">Danh sách</span>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-slate-900">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </header>

            {/* ══════════════ QUESTION CONTENT ══════════════ */}
            <main className="flex-1 overflow-y-auto pb-36">
                <div className="mx-auto max-w-3xl px-5 py-6 lg:px-8">
                    {currentQuestion && (
                        <div className="space-y-5">
                            {/* Question number + text */}
                            <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-xs font-bold text-cyan-400">
                                        {currentIndex + 1}
                                    </span>
                                    <span className="text-xs font-medium text-slate-500">/ {questions.length}</span>
                                </div>
                                <p className="text-base leading-relaxed text-white whitespace-pre-wrap">
                                    {currentQuestion.content}
                                </p>
                            </div>

                            {/* Answer options */}
                            <div className="space-y-2.5">
                                {currentQuestion.answers.map((answer, idx) => {
                                    const isSelected = userAnswers[currentQuestion.id] === answer.id;
                                    const result = answerResults[currentQuestion.id];
                                    const isCorrectAnswer = isSubmitted && result && result.correctAnswerId === answer.id;
                                    const isWrongSelection = isSubmitted && isSelected && result && !result.isCorrect;

                                    let cardStyle = "border-white/[0.06] bg-slate-900/40 hover:border-white/[0.12] hover:bg-slate-900/60";
                                    let letterStyle = "bg-slate-800 text-slate-400";

                                    if (isSubmitted) {
                                        if (isCorrectAnswer) {
                                            cardStyle = "border-green-500/40 bg-green-500/10";
                                            letterStyle = "bg-green-500/20 text-green-400";
                                        } else if (isWrongSelection) {
                                            cardStyle = "border-red-500/40 bg-red-500/10";
                                            letterStyle = "bg-red-500/20 text-red-400";
                                        }
                                    } else if (isSelected) {
                                        cardStyle = "border-cyan-500/40 bg-cyan-500/10";
                                        letterStyle = "bg-cyan-500 text-white";
                                    }

                                    return (
                                        <button
                                            key={answer.id}
                                            className={`w-full text-left border rounded-xl p-4 transition-all duration-200 ${cardStyle} ${!isSubmitted ? "cursor-pointer active:scale-[0.99]" : "cursor-default"}`}
                                            onClick={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                                            disabled={isSubmitted}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold flex-shrink-0 ${letterStyle}`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className={`flex-1 text-sm leading-relaxed pt-1 ${isSelected || isCorrectAnswer ? "text-white" : "text-slate-300"}`}>
                                                    {answer.content}
                                                </span>
                                                {isSubmitted && isCorrectAnswer && (
                                                    <span className="text-green-400 text-lg flex-shrink-0">✓</span>
                                                )}
                                                {isSubmitted && isWrongSelection && (
                                                    <span className="text-red-400 text-lg flex-shrink-0">✕</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation (after submit) */}
                            {isSubmitted && answerResults[currentQuestion.id]?.explanation && (
                                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-sm">💡</span>
                                        <span className="text-sm font-bold text-blue-400">Giải thích</span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {answerResults[currentQuestion.id].explanation}
                                    </p>
                                </div>
                            )}

                            {/* ── Note Section ── */}
                            <div>
                                <button
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${openNoteId === currentQuestion.id
                                        ? "bg-amber-500/10 border-amber-500/30"
                                        : questionNotes[currentQuestion.id]
                                            ? "bg-amber-500/5 border-amber-500/20"
                                            : "bg-slate-900/40 border-white/[0.06] hover:border-white/[0.12]"
                                        }`}
                                    onClick={() => setOpenNoteId(openNoteId === currentQuestion.id ? null : currentQuestion.id)}
                                >
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${questionNotes[currentQuestion.id] ? "bg-amber-500/20" : "bg-slate-800"}`}>
                                        <span className={`text-sm ${questionNotes[currentQuestion.id] ? "text-amber-400" : "text-slate-500"}`}>📝</span>
                                    </div>
                                    <span className={`flex-1 text-left text-sm font-medium ${questionNotes[currentQuestion.id] ? "text-amber-400" : "text-slate-400"}`}>
                                        {questionNotes[currentQuestion.id] ? "Xem ghi chú" : "Thêm ghi chú"}
                                    </span>
                                    {questionNotes[currentQuestion.id] && (
                                        <span className="h-2 w-2 rounded-full bg-amber-400 flex-shrink-0" />
                                    )}
                                    <span className="text-slate-500 text-xs flex-shrink-0">
                                        {openNoteId === currentQuestion.id ? "▲" : "▼"}
                                    </span>
                                </button>

                                {/* Note editor (collapsible) */}
                                {openNoteId === currentQuestion.id && (
                                    <div className="mt-2 rounded-2xl border border-white/[0.06] bg-slate-900/60 p-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <textarea
                                            className="w-full rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-colors"
                                            rows={4}
                                            placeholder="Ghi chú của bạn cho câu hỏi này…"
                                            value={questionNotes[currentQuestion.id] || ""}
                                            onChange={(e) =>
                                                setQuestionNotes((prev) => ({
                                                    ...prev,
                                                    [currentQuestion.id]: e.target.value,
                                                }))
                                            }
                                        />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-600">
                                                {(questionNotes[currentQuestion.id] || "").length} ký tự
                                            </span>
                                            <div className="flex gap-2">
                                                {questionNotes[currentQuestion.id] && (
                                                    <button
                                                        className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-700 transition-colors"
                                                        onClick={() => handleDeleteNote(currentQuestion.id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
                                                <button
                                                    className="rounded-lg bg-amber-500/15 border border-amber-500/25 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/25 transition-colors disabled:opacity-40"
                                                    onClick={() => handleSaveNote(currentQuestion.id)}
                                                    disabled={isSavingNote || !(questionNotes[currentQuestion.id]?.trim())}
                                                >
                                                    {isSavingNote ? "Đang lưu…" : "💾 Lưu ghi chú"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ══════════════ NAVIGATION FOOTER ══════════════ */}
            <footer className="fixed bottom-0 inset-x-0 z-40 border-t border-white/[0.06] bg-slate-950/90 backdrop-blur-xl">
                <div className="mx-auto max-w-3xl px-5 py-4 lg:px-8">
                    <div className="flex gap-3">
                        {/* Previous */}
                        <button
                            className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-slate-900 border border-white/[0.06] h-12 text-sm font-medium text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                        >
                            <span>‹</span> Trước
                        </button>

                        {/* Next / Submit / Complete */}
                        {currentIndex === questions.length - 1 ? (
                            isSubmitted ? (
                                <button
                                    className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 h-12 text-sm font-bold text-white shadow-lg shadow-green-600/20 hover:opacity-90 transition-opacity"
                                    onClick={() => router.back()}
                                >
                                    ✓ Hoàn thành
                                </button>
                            ) : (
                                <button
                                    className="flex-1 flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 h-12 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 hover:opacity-90 transition-opacity disabled:opacity-50"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        "Nộp bài"
                                    )}
                                </button>
                            )
                        ) : (
                            <button
                                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 h-12 text-sm font-medium text-white shadow-lg shadow-cyan-600/20 hover:opacity-90 transition-opacity"
                                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                            >
                                Tiếp <span>›</span>
                            </button>
                        )}
                    </div>

                    {/* Mini question navigator bar */}
                    <div className="flex items-center justify-center mt-3">
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.06] bg-white/[0.03] text-xs text-slate-400 hover:bg-white/[0.06] transition-colors"
                            onClick={() => setIsDrawerOpen(true)}
                        >
                            <span className="text-cyan-400">▦</span>
                            <span>Câu {currentIndex + 1}/{questions.length}</span>
                            <span className="text-slate-600">·</span>
                            <span className="text-cyan-400">{answeredCount} đã làm</span>
                            <span className="text-slate-600">▲</span>
                        </button>
                    </div>
                </div>
            </footer>

            {/* ══════════════ QUESTION GRID DRAWER ══════════════ */}
            {/* Overlay */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* Drawer Panel */}
            <div
                className={`fixed bottom-0 inset-x-0 z-50 bg-slate-950 rounded-t-3xl border-t border-white/[0.08] transition-transform duration-300 ease-out ${isDrawerOpen ? "translate-y-0" : "translate-y-full"
                    }`}
                style={{ maxHeight: "75vh" }}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="h-1 w-10 rounded-full bg-slate-700" />
                </div>

                {/* Drawer header */}
                <div className="flex items-center justify-between px-5 pb-4 border-b border-white/[0.06]">
                    <div>
                        <h3 className="text-base font-bold text-white">Danh sách câu hỏi</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{answeredCount}/{questions.length} câu đã trả lời</p>
                    </div>
                    <button
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors"
                        onClick={() => setIsDrawerOpen(false)}
                    >
                        ✕
                    </button>
                </div>

                {/* Question Grid */}
                <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(75vh - 120px)" }}>
                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-13 gap-1.5">
                        {questions.map((q, idx) => {
                            const isAnswered = userAnswers[q.id] !== undefined;
                            const isCurrent = idx === currentIndex;
                            const result = answerResults[q.id];
                            const hasNote = !!questionNotes[q.id];

                            let cellBg = "bg-slate-800/60 border-slate-700/50 text-slate-500";

                            if (isSubmitted && result) {
                                cellBg = result.isCorrect
                                    ? "bg-green-500/15 border-green-500/40 text-green-400"
                                    : "bg-red-500/15 border-red-500/40 text-red-400";
                            } else if (isCurrent) {
                                cellBg = "bg-cyan-500/15 border-cyan-400/50 text-cyan-400 ring-2 ring-cyan-400/30";
                            } else if (isAnswered) {
                                cellBg = "bg-emerald-500/15 border-emerald-500/40 text-emerald-400";
                            }

                            return (
                                <button
                                    key={q.id}
                                    className={`relative h-9 w-full rounded-lg border flex items-center justify-center font-semibold text-xs transition-all active:scale-95 ${cellBg}`}
                                    onClick={() => {
                                        setCurrentIndex(idx);
                                        setIsDrawerOpen(false);
                                    }}
                                >
                                    {idx + 1}
                                    {hasNote && (
                                        <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-4 border-t border-white/[0.06]">
                        <div className="flex items-center gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-slate-700" />
                            <span className="text-xs text-slate-500">Chưa làm</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-cyan-400" />
                            <span className="text-xs text-slate-500">Đang xem</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-emerald-400" />
                            <span className="text-xs text-slate-500">Đã làm</span>
                        </div>
                        {isSubmitted && (
                            <>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-green-500" />
                                    <span className="text-xs text-slate-500">Đúng</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-red-500" />
                                    <span className="text-xs text-slate-500">Sai</span>
                                </div>
                            </>
                        )}
                        <div className="flex items-center gap-1.5">
                            <div className="relative h-3 w-3 rounded-full bg-slate-700">
                                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                            </div>
                            <span className="text-xs text-slate-500">Có ghi chú</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────── page wrapper ──────────── */
const ExamPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Spinner visible />
                <p className="text-slate-500 text-sm mt-4">Đang tải…</p>
            </div>
        }>
            <ExamContent />
        </Suspense>
    );
};

export default ExamPage;
