"use client";

import React, { useEffect, useState, useCallback, useRef, Suspense } from "react";
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
    const mode = searchParams.get("mode") as "practice" | "test" | null;
    const isTestMode = mode === "test";

    /* ── localStorage key ── */
    const storageKey = examId ? `exam_progress_${examId}_${mode || "practice"}` : null;

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

    // Timer (test mode only)
    const [timeRemaining, setTimeRemaining] = useState<number>(0); // in seconds
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const hasAutoSubmitted = useRef(false);
    const hasLoadedProgress = useRef(false);

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

            // Load saved progress from localStorage
            if (storageKey && !hasLoadedProgress.current) {
                hasLoadedProgress.current = true;
                try {
                    const saved = localStorage.getItem(storageKey);
                    if (saved) {
                        const progress = JSON.parse(saved);
                        if (progress.userAnswers) setUserAnswers(progress.userAnswers);
                        if (progress.answerResults) setAnswerResults(progress.answerResults);
                        if (typeof progress.currentIndex === "number") setCurrentIndex(progress.currentIndex);
                        if (progress.questionNotes) setQuestionNotes(progress.questionNotes);
                        if (progress.timeRemaining && isTestMode) setTimeRemaining(progress.timeRemaining);
                        openSnackbar({
                            text: "📂 Đã khôi phục tiến độ làm bài trước đó!",
                            type: "info",
                            duration: 3000,
                        });
                    }
                } catch {
                    // Ignore invalid localStorage data
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể tải đề thi");
        } finally {
            setIsLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examId]);

    useEffect(() => {
        fetchExamData();
    }, [fetchExamData]);

    // Auto-save progress to localStorage
    useEffect(() => {
        if (!storageKey || isSubmitted || isLoading) return;
        // Chỉ lưu khi đã có dữ liệu (tránh ghi đè bằng state rỗng)
        if (Object.keys(userAnswers).length === 0 && currentIndex === 0) return;

        const progress = {
            userAnswers,
            answerResults,
            currentIndex,
            questionNotes,
            timeRemaining: isTestMode ? timeRemaining : undefined,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem(storageKey, JSON.stringify(progress));
    }, [storageKey, userAnswers, answerResults, currentIndex, questionNotes, timeRemaining, isTestMode, isSubmitted, isLoading]);

    // Initialize timer when exam loads (test mode)
    useEffect(() => {
        if (isTestMode && exam && !isSubmitted) {
            setTimeRemaining(exam.durationMinutes * 60);
        }
    }, [isTestMode, exam, isSubmitted]);

    // Countdown logic
    useEffect(() => {
        if (!isTestMode || isSubmitted || timeRemaining <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTestMode, isSubmitted, timeRemaining > 0]);

    // Auto-submit when time runs out
    useEffect(() => {
        if (isTestMode && timeRemaining === 0 && !isSubmitted && !hasAutoSubmitted.current && exam && questions.length > 0) {
            hasAutoSubmitted.current = true;
            openSnackbar({
                text: "⏰ Hết giờ! Bài thi đã được tự động nộp.",
                type: "warning",
                duration: 5000,
            });
            handleSubmit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeRemaining, isTestMode, isSubmitted, exam, questions.length]);

    // Format time helper
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };
    const isTimeLow = isTestMode && timeRemaining > 0 && timeRemaining <= 300; // < 5 min

    /* ── handlers ── */
    const handleSelectAnswer = async (questionId: number, answerId: number) => {
        if (isSubmitted) return;

        //ở practice mode không cho chọn lại nếu đã chọn
        if (!isTestMode && answerResults[questionId]) return;

        setUserAnswers((prev) => ({ ...prev, [questionId]: answerId }));

        //check đáp án ngay ở pratice mode
        if (!isTestMode) {
            try {
                const result = await questionService.checkAnswer(questionId, answerId);
                setAnswerResults((prev) => ({
                    ...prev,
                    [questionId]: {
                        questionId,
                        isCorrect: result.isCorrect,
                        userAnswerId: answerId,
                        correctAnswerId: result.correctAnswerId,
                        explanation: result.explanation,
                    },
                }))
            } catch (error) {
                console.error("Check answer error:", error);
            }
        }
    };

    const handleSubmit = async () => {
        const answeredCount = Object.keys(userAnswers).length;

        // Practice mode: đã check từng câu rồi, chỉ cần tổng kết
        if (!isTestMode) {
            if (answeredCount < questions.length) {
                openSnackbar({
                    text: `Bạn còn ${questions.length - answeredCount} câu chưa trả lời!`,
                    type: "warning",
                    duration: 3000,
                });
                return;
            }

            // Lưu kết quả nếu đã đăng nhập
            const token = getAuthToken();
            if (token && examId) {
                try {
                    const answers = Object.entries(userAnswers).map(([qId, aId]) => ({
                        questionId: parseInt(qId),
                        answerId: aId,
                    }));
                    await examResultService.submitExam({
                        examId: parseInt(examId),
                        answers,
                    });
                } catch {
                    // Không block flow nếu lưu thất bại
                }
            }

            const score = calculateScore();
            openSnackbar({
                text: `Điểm: ${score.percent}% (${score.correct}/${score.total})`,
                type: score.percent >= 70 ? "success" : "warning",
                duration: 5000,
            });
            setIsSubmitted(true);
            // Xóa tiến độ localStorage khi hoàn thành
            if (storageKey) localStorage.removeItem(storageKey);
            return;
        }

        // Test mode: check tất cả cùng lúc khi nộp bài
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
            // Xóa tiến độ localStorage khi hoàn thành
            if (storageKey) localStorage.removeItem(storageKey);
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
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center">
                <Spinner visible />
                <p className="text-[var(--text-muted)] text-sm mt-4">Đang tải đề thi…</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6 gap-4">
                <span className="text-4xl">⚠️</span>
                <p className="text-red-600 text-sm font-medium dark:text-red-400">{error}</p>
                <button onClick={() => router.back()} className="secondary-action rounded-lg px-5 py-2.5 text-sm">
                    Quay lại
                </button>
            </div>
        );
    }
    if (!exam || questions.length === 0) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-6 gap-4">
                <span className="text-5xl">📝</span>
                <p className="text-[var(--text-secondary)] text-base font-medium">{!exam ? `Không tìm thấy đề thi (ID: ${examId})` : `Chưa có câu hỏi trong đề thi "${exam.title}"`}</p>
                <button onClick={() => router.back()} className="secondary-action rounded-lg px-5 py-2.5 text-sm">
                    Quay lại
                </button>
            </div>
        );
    }

    /* ──────── RENDER ──────── */
    return (
        <div className="app-shell relative flex min-h-screen flex-col selection:bg-blue-100 dark:selection:bg-blue-900 dark:selection:text-blue-100">
            {/* ══════════════ HEADER ══════════════ */}
            <header className="site-header sticky top-0 z-50 shadow-sm">
                <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3 lg:px-8">
                    {/* Close */}
                    <button
                        onClick={() => router.back()}
                        className="icon-button flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    >
                        ✕
                    </button>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                        <h1 className="truncate text-base font-bold text-[var(--text-primary)]">{exam.title}</h1>
                        <p className="text-xs text-[var(--text-muted)]">
                            Câu {currentIndex + 1}/{questions.length}
                            {!isSubmitted && <span className="ml-2 text-blue-600 dark:text-blue-400">· {answeredCount} đã trả lời</span>}
                        </p>
                    </div>

                    {/* Timer badge (test mode) */}
                    {isTestMode && !isSubmitted && (
                        <div className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-bold ${isTimeLow
                            ? "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300"
                            : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}>
                            <span>{isTimeLow ? "🔥" : "⏱️"}</span>
                            <span className="font-mono tabular-nums">{formatTime(timeRemaining)}</span>
                        </div>
                    )}

                    {/* Mode badge */}
                    {!isSubmitted && (
                        <div className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold sm:flex ${isTestMode
                            ? "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                            : "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                            }`}>
                            <span>{isTestMode ? "🏆" : "📖"}</span>
                            <span>{isTestMode ? "Thi thử" : "Luyện tập"}</span>
                        </div>
                    )}

                    {/* Score badge (after submit) */}
                    {isSubmitted && score && (
                        <div className={`rounded-full border px-3.5 py-1.5 text-sm font-bold ${score.percent >= 70 ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/60 dark:text-green-300" : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300"}`}>
                            {score.correct}/{score.total} ({score.percent}%)
                        </div>
                    )}

                    {/* Grid button */}
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="secondary-action flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium"
                    >
                        <span className="text-blue-600 dark:text-blue-400">▦</span>
                        <span className="hidden sm:inline">Danh sách</span>
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-slate-200 dark:bg-slate-800">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300"
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
                            <div className="surface-card rounded-xl p-6">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                        {currentIndex + 1}
                                    </span>
                                    <span className="text-xs font-medium text-[var(--text-muted)]">/ {questions.length}</span>
                                </div>
                                <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--text-primary)]">
                                    {currentQuestion.content}
                                </p>
                            </div>

                            {/* Answer options */}
                            <div className="space-y-2.5">
                                {currentQuestion.answers.map((answer, idx) => {
                                    const isSelected = userAnswers[currentQuestion.id] === answer.id;
                                    const result = answerResults[currentQuestion.id];
                                    const hasResult = !!result; // true nếu câu đã được check (practice) hoặc đã submit
                                    const isCorrectAnswer = hasResult && result.correctAnswerId === answer.id;
                                    const isWrongSelection = hasResult && isSelected && !result.isCorrect;

                                    let cardStyle = "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800";
                                    let letterStyle = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";

                                    if (hasResult) {
                                        if (isCorrectAnswer) {
                                            cardStyle = "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/60";
                                            letterStyle = "bg-green-100 text-green-700 dark:bg-green-900/70 dark:text-green-300";
                                        } else if (isWrongSelection) {
                                            cardStyle = "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/60";
                                            letterStyle = "bg-red-100 text-red-700 dark:bg-red-900/70 dark:text-red-300";
                                        }
                                    } else if (isSelected) {
                                        cardStyle = "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/70";
                                        letterStyle = "bg-blue-600 text-white dark:bg-blue-500 dark:text-white";
                                    }

                                    return (
                                        <button
                                            key={answer.id}
                                            className={`w-full rounded-xl border p-4 text-left transition-colors ${cardStyle} ${!(isSubmitted || hasResult) ? "cursor-pointer" : "cursor-default"}`}
                                            onClick={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                                            disabled={isSubmitted || hasResult}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold flex-shrink-0 ${letterStyle}`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className={`flex-1 pt-1 text-sm leading-relaxed ${isSelected || isCorrectAnswer ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}`}>
                                                    {answer.content}
                                                </span>
                                                {isCorrectAnswer && (
                                                    <span className="text-green-400 text-lg flex-shrink-0 dark:text-green-300">✓</span>
                                                )}
                                                {isWrongSelection && (
                                                    <span className="text-red-400 text-lg flex-shrink-0 dark:text-red-300">✕</span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation (after submit) */}
                            {answerResults[currentQuestion.id]?.explanation && (
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/60">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-sm dark:bg-blue-900/70">💡</span>
                                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Giải thích</span>
                                    </div>
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                        {answerResults[currentQuestion.id].explanation}
                                    </p>
                                </div>
                            )}

                            {/* ── Note Section ── */}
                            <div>
                                <button
                                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors ${openNoteId === currentQuestion.id
                                        ? "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/60"
                                        : questionNotes[currentQuestion.id]
                                            ? "border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/40"
                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                                        }`}
                                    onClick={() => setOpenNoteId(openNoteId === currentQuestion.id ? null : currentQuestion.id)}
                                >
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${questionNotes[currentQuestion.id] ? "bg-amber-100 dark:bg-amber-900/70" : "bg-slate-100 dark:bg-slate-800"}`}>
                                        <span className={`text-sm ${questionNotes[currentQuestion.id] ? "text-amber-700 dark:text-amber-300" : "text-slate-500 dark:text-slate-400"}`}>📝</span>
                                    </div>
                                    <span className={`flex-1 text-left text-sm font-medium ${questionNotes[currentQuestion.id] ? "text-amber-800 dark:text-amber-300" : "text-slate-600 dark:text-slate-300"}`}>
                                        {questionNotes[currentQuestion.id] ? "Xem ghi chú" : "Thêm ghi chú"}
                                    </span>
                                    {questionNotes[currentQuestion.id] && (
                                        <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                                    )}
                                    <span className="text-slate-500 text-xs flex-shrink-0 dark:text-slate-400">
                                        {openNoteId === currentQuestion.id ? "▲" : "▼"}
                                    </span>
                                </button>

                                {/* Note editor (collapsible) */}
                                {openNoteId === currentQuestion.id && (
                                    <div className="mt-2 space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 dark:border-slate-700 dark:bg-slate-900">
                                        <textarea
                                            className="w-full resize-none rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950"
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
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {(questionNotes[currentQuestion.id] || "").length} ký tự
                                            </span>
                                            <div className="flex gap-2">
                                                {questionNotes[currentQuestion.id] && (
                                                    <button
                                                        className="secondary-action rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
                                                        onClick={() => handleDeleteNote(currentQuestion.id)}
                                                    >
                                                        Xóa
                                                    </button>
                                                )}
                                                <button
                                                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-40 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-900/70"
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
            <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950">
                <div className="mx-auto max-w-3xl px-5 py-4 lg:px-8">
                    <div className="flex gap-3">
                        {/* Previous */}
                        <button
                            className="secondary-action flex h-12 flex-1 items-center justify-center gap-1 rounded-lg text-sm font-medium disabled:opacity-40"
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                        >
                            <span>‹</span> Trước
                        </button>

                        {/* Next / Submit / Complete */}
                        {currentIndex === questions.length - 1 ? (
                            isSubmitted ? (
                                <button
                                    className="flex h-12 flex-1 items-center justify-center rounded-lg border border-green-600 bg-green-600 text-sm font-bold text-white transition-colors hover:bg-green-700 dark:border-green-500 dark:bg-green-600 dark:hover:bg-green-500"
                                    onClick={() => router.back()}
                                >
                                    ✓ Hoàn thành
                                </button>
                            ) : (
                                <button
                                    className="primary-action flex h-12 flex-1 items-center justify-center rounded-lg text-sm font-bold disabled:opacity-50"
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
                                className="primary-action flex h-12 flex-1 items-center justify-center gap-1 rounded-lg text-sm font-medium"
                                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                            >
                                Tiếp <span>›</span>
                            </button>
                        )}
                    </div>

                    {/* Mini question navigator bar */}
                    <div className="flex items-center justify-center mt-3">
                        <button
                            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            onClick={() => setIsDrawerOpen(true)}
                        >
                            <span className="text-blue-600 dark:text-blue-400">▦</span>
                            <span>Câu {currentIndex + 1}/{questions.length}</span>
                            <span className="text-slate-400 dark:text-slate-500">·</span>
                            <span className="text-blue-600 dark:text-blue-400">{answeredCount} đã làm</span>
                            <span className="text-slate-400 dark:text-slate-500">▲</span>
                        </button>
                    </div>
                </div>
            </footer>

            {/* ══════════════ QUESTION GRID DRAWER ══════════════ */}
            {/* Overlay */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-950/50 transition-opacity"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* Drawer Panel */}
            <div
                className={`fixed inset-x-0 bottom-0 z-50 rounded-t-xl border-t border-slate-200 bg-white shadow-sm transition-transform duration-300 ease-out dark:border-slate-700 dark:bg-slate-950 ${isDrawerOpen ? "translate-y-0" : "translate-y-full"
                    }`}
                style={{ maxHeight: "75vh" }}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
                </div>

                {/* Drawer header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 pb-4 dark:border-slate-700">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Danh sách câu hỏi</h3>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{answeredCount}/{questions.length} câu đã trả lời</p>
                    </div>
                    <button
                        className="icon-button flex h-8 w-8 items-center justify-center rounded-full"
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

                            let cellBg = "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400";

                            if (result) {
                                cellBg = result.isCorrect
                                    ? "border-green-300 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/60 dark:text-green-300"
                                    : "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300";
                            } else if (isCurrent) {
                                cellBg = "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-100 dark:border-blue-500 dark:bg-blue-950/70 dark:text-blue-300 dark:ring-blue-950";
                            } else if (isAnswered) {
                                cellBg = "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300";
                            }

                            return (
                                <button
                                    key={q.id}
                                    className={`relative flex h-9 w-full items-center justify-center rounded-lg border text-xs font-semibold transition-colors ${cellBg}`}
                                    onClick={() => {
                                        setCurrentIndex(idx);
                                        setIsDrawerOpen(false);
                                    }}
                                >
                                    {idx + 1}
                                    {hasNote && (
                                        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">Chưa làm</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-500" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">Đang xem</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-3 w-3 rounded-full bg-blue-300 dark:bg-blue-800" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">Đã làm</span>
                        </div>
                        {(isSubmitted || Object.keys(answerResults).length > 0) && (
                            <>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-green-500 dark:bg-green-400" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Đúng</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-red-500 dark:bg-red-400" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Sai</span>
                                </div>
                            </>
                        )}
                        <div className="flex items-center gap-1.5">
                            <div className="relative h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700">
                                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400" />
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Có ghi chú</span>
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
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center">
                <Spinner visible />
                <p className="text-[var(--text-muted)] text-sm mt-4">Đang tải…</p>
            </div>
        }>
            <ExamContent />
        </Suspense>
    );
};

export default ExamPage;
