"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import { useSnackbar } from "@/components/Snackbar";
import { examService, Exam } from "@/services/exam";
import { questionService, Question, CheckAnswerResponse } from "@/services/question";

// State for user answers
type UserAnswers = Record<number, number>; // questionId -> answerId
type AnswerResults = Record<number, CheckAnswerResponse>; // questionId -> check result

function ExamContent() {
    const router = useRouter();
    const { openSnackbar } = useSnackbar();
    const searchParams = useSearchParams();
    const examId = searchParams.get("id");

    const [exam, setExam] = useState<Exam | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswers>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [answerResults, setAnswerResults] = useState<AnswerResults>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchExamData = useCallback(async () => {
        if (!examId) return;
        setIsLoading(true);
        setError(null);
        try {
            // Fetch exam details
            const examData = await examService.getById(parseInt(examId));
            setExam(examData);

            // Fetch questions (without correct answers)
            const questionsData = await questionService.getByExam(parseInt(examId), false);
            setQuestions(questionsData);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Không thể tải đề thi";
            setError(message);
            console.error("Fetch exam error:", err);
        } finally {
            setIsLoading(false);
        }
    }, [examId]);

    useEffect(() => {
        fetchExamData();
    }, [fetchExamData]);

    const handleSelectAnswer = (questionId: number, answerId: number) => {
        if (isSubmitted) return;
        setUserAnswers((prev) => ({
            ...prev,
            [questionId]: answerId,
        }));
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
            // Check all answers using the new API
            const results: AnswerResults = {};
            for (const question of questions) {
                const answerId = userAnswers[question.id];
                if (answerId) {
                    const result = await questionService.checkAnswer(question.id, answerId);
                    results[question.id] = result;
                }
            }
            setAnswerResults(results);
            setIsSubmitted(true);

            // Update questions with explanations from results
            const updatedQuestions = questions.map(q => ({
                ...q,
                explanation: results[q.id]?.explanation || q.explanation,
            }));
            setQuestions(updatedQuestions);

        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Không thể nộp bài";
            openSnackbar({
                text: message,
                type: "error",
                duration: 3000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        Object.values(answerResults).forEach((result) => {
            if (result.isCorrect) correct++;
        });
        const total = questions.length;
        return { correct, total, percent: total > 0 ? Math.round((correct / total) * 100) : 0 };
    };

    const currentQuestion = questions[currentIndex];

    if (isLoading) {
        return (
            <div className="bg-slate-900 flex flex-col min-h-screen items-center justify-center">
                <Spinner visible />
                <p className="text-slate-400 text-sm mt-3">Đang tải đề thi...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-slate-900 flex flex-col min-h-screen items-center justify-center px-6">
                <span className="text-red-400 text-4xl mb-3">⚠</span>
                <p className="text-red-400 text-sm mb-4">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="bg-slate-900 flex flex-col min-h-screen items-center justify-center px-6">
                <span className="text-yellow-400 text-4xl mb-3">⚠</span>
                <p className="text-yellow-400 text-sm mb-4">Không tìm thấy đề thi (ID: {examId})</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="bg-slate-900 flex flex-col min-h-screen items-center justify-center px-6">
                <span className="text-slate-400 text-4xl mb-3">📝</span>
                <p className="text-slate-400 text-sm mb-2">Đề thi: {exam.title}</p>
                <p className="text-slate-500 text-xs mb-4">Chưa có câu hỏi nào trong đề thi này</p>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                >
                    Quay lại
                </button>
            </div>
        );
    }

    const score = isSubmitted ? calculateScore() : null;

    return (
        <div className="bg-slate-900 flex flex-col min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <header className="sticky top-0 z-50 px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button
                        className="w-9 h-9 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => router.back()}
                    >
                        <span className="text-white">✕</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-white text-base font-bold truncate">
                            {exam.title}
                        </h1>
                        <p className="text-slate-400 text-xs">
                            Câu {currentIndex + 1}/{questions.length}
                        </p>
                    </div>
                    {isSubmitted && score && (
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${score.percent >= 70 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                            {score.correct}/{score.total} ({score.percent}%)
                        </div>
                    )}
                </div>
            </header>

            {/* Progress Bar */}
            <div className="px-4 py-2">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Content */}
            <main className="flex-1 px-4 py-4 overflow-y-auto pb-32">
                {currentQuestion && (
                    <div className="space-y-4">
                        {/* Question Text */}
                        <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-4">
                            <p className="text-white text-base leading-relaxed whitespace-pre-wrap">
                                {currentQuestion.content}
                            </p>
                        </div>

                        {/* Answers */}
                        <div className="space-y-2">
                            {currentQuestion.answers.map((answer, idx) => {
                                const isSelected = userAnswers[currentQuestion.id] === answer.id;
                                const result = answerResults[currentQuestion.id];
                                const isCorrectAnswer = isSubmitted && result && result.correctAnswerId === answer.id;
                                const isWrongSelection = isSubmitted && isSelected && result && !result.isCorrect;

                                let bgColor = "bg-slate-800/40 border-white/5";
                                if (isSubmitted) {
                                    if (isCorrectAnswer) {
                                        bgColor = "bg-green-500/20 border-green-500/50";
                                    } else if (isWrongSelection) {
                                        bgColor = "bg-red-500/20 border-red-500/50";
                                    }
                                } else if (isSelected) {
                                    bgColor = "bg-cyan-500/20 border-cyan-500/50";
                                }

                                return (
                                    <button
                                        key={answer.id}
                                        className={`w-full border rounded-xl p-4 cursor-pointer transition-all ${bgColor} ${!isSubmitted ? "active:scale-[0.98]" : ""} text-left`}
                                        onClick={() => handleSelectAnswer(currentQuestion.id, answer.id)}
                                        disabled={isSubmitted}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${isSelected ? "bg-cyan-500 text-white" : "bg-slate-700 text-slate-400"}`}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`flex-1 text-sm ${isSelected || isCorrectAnswer ? "text-white" : "text-slate-300"}`}>
                                                {answer.content}
                                            </span>
                                            {isSubmitted && isCorrectAnswer && (
                                                <span className="text-green-400">✓</span>
                                            )}
                                            {isSubmitted && isWrongSelection && (
                                                <span className="text-red-400">✕</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Explanation (only after submission) */}
                        {isSubmitted && answerResults[currentQuestion.id]?.explanation && (
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-blue-400">ℹ</span>
                                    <span className="text-blue-400 font-bold text-sm">Giải thích</span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                    {answerResults[currentQuestion.id].explanation}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Navigation Footer */}
            <footer className="fixed bottom-0 left-0 right-0 px-4 py-4 bg-slate-900/95 backdrop-blur-md border-t border-white/5">
                <div className="flex gap-3">
                    <button
                        className="flex-1 bg-slate-800 text-white rounded-xl h-12 font-medium disabled:opacity-50 hover:bg-slate-700 transition-colors flex items-center justify-center"
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    >
                        <span className="mr-1">‹</span> Trước
                    </button>

                    {currentIndex === questions.length - 1 ? (
                        isSubmitted ? (
                            <button
                                className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl h-12 font-bold hover:opacity-90 transition-opacity"
                                onClick={() => router.back()}
                            >
                                Hoàn thành
                            </button>
                        ) : (
                            <button
                                className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl h-12 font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
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
                            className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-xl h-12 font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                        >
                            Tiếp <span className="ml-1">›</span>
                        </button>
                    )}
                </div>

                {/* Question Navigator (dots) */}
                <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
                    {questions.map((q, idx) => {
                        const isAnswered = userAnswers[q.id] !== undefined;
                        const isCurrent = idx === currentIndex;
                        const result = answerResults[q.id];

                        let dotColor = "bg-slate-700";
                        if (isSubmitted && result) {
                            dotColor = result.isCorrect ? "bg-green-500" : "bg-red-500";
                        } else if (isCurrent) {
                            dotColor = "bg-cyan-400";
                        } else if (isAnswered) {
                            dotColor = "bg-cyan-600";
                        }

                        return (
                            <button
                                key={q.id}
                                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${dotColor} ${isCurrent ? "scale-125" : ""}`}
                                onClick={() => setCurrentIndex(idx)}
                            ></button>
                        );
                    })}
                </div>
            </footer>
        </div>
    );
}

const ExamPage = () => {
    return (
        <Suspense fallback={
            <div className="bg-slate-900 flex flex-col min-h-screen items-center justify-center">
                <Spinner visible />
                <p className="text-slate-400 text-sm mt-3">Đang tải đề thi...</p>
            </div>
        }>
            <ExamContent />
        </Suspense>
    );
};

export default ExamPage;
