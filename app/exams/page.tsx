"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Spinner from "@/components/Spinner";
import { examService, Exam } from "@/services/exam";
import { courseService, Course } from "@/services/course";

// Level colors for badges
const levelColors: Record<string, string> = {
    Foundational: "bg-green-500/20 text-green-400",
    Associate: "bg-blue-500/20 text-blue-400",
    Professional: "bg-purple-500/20 text-purple-400",
    Specialty: "bg-pink-500/20 text-pink-400",
};

function ExamsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const courseId = searchParams.get("courseId");

    const [exams, setExams] = useState<Exam[]>([]);
    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchExams = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (courseId) {
                const courseData = await courseService.getById(parseInt(courseId));
                setCourse(courseData);
                const examsData = await examService.getByCourse(parseInt(courseId));
                setExams(examsData);
            } else {
                const response = await examService.getAll(1, 20);
                setExams(response.data);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Không thể tải đề thi";
            setError(message);
            console.error("Fetch exams error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    return (
        <div className="bg-slate-900 flex flex-col min-h-screen relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-20 -left-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <header className="sticky top-0 z-50 px-4 py-3 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button
                        className="w-9 h-9 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => router.back()}
                    >
                        <span className="text-white">←</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-white text-lg font-bold truncate">
                            {course ? course.title : "Đề thi"}
                        </h1>
                        {course && (
                            <p className={`text-xs ${levelColors[course.level] || "text-slate-400"}`}>
                                {course.level} • {course.provider.name}
                            </p>
                        )}
                    </div>
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
                            onClick={fetchExams}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : exams.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <span className="text-slate-500 text-4xl">📝</span>
                        <p className="text-slate-400 text-sm">Không có đề thi nào</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {exams.map((exam) => (
                            <div
                                key={exam.id}
                                className="bg-slate-800/40 border border-white/5 rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all hover:bg-slate-800/60"
                                onClick={() => router.push(`/exam?id=${exam.id}`)}
                            >
                                <div className="flex gap-3">
                                    {/* Icon */}
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex-shrink-0 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                        <span className="text-white text-2xl">📝</span>
                                    </div>

                                    {/* Exam Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                                            {exam.title}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${levelColors[exam.course.level] || "bg-slate-500/20 text-slate-400"}`}>
                                                {exam.course.level}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-500 text-xs">
                                            <div className="flex items-center gap-1">
                                                <span>🕐</span>
                                                <span>{exam.durationMinutes} phút</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span>📋</span>
                                                <span>{exam._count.questions} câu</span>
                                            </div>
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
            </main>
        </div>
    );
}

const ExamsPage = () => {
    return (
        <Suspense fallback={
            <div className="bg-slate-900 flex flex-col min-h-screen items-center justify-center">
                <Spinner visible />
                <p className="text-slate-400 text-sm mt-3">Đang tải...</p>
            </div>
        }>
            <ExamsContent />
        </Suspense>
    );
};

export default ExamsPage;
