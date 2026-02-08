import { API_URL } from "@/lib/api";

export interface CourseInfo {
    id: number;
    title: string;
    level: string;
}

export interface Exam {
    id: number;
    title: string;
    description: string | null;
    durationMinutes: number;
    totalQuestions: number;
    createdAt: string;
    course: CourseInfo;
    _count: {
        questions: number;
    };
}

export interface Answer {
    id: number;
    content: string;
    isCorrect?: boolean;
}

export interface Question {
    id: number;
    content: string;
    explanation: string | null;
    answers: Answer[];
}

export interface ExamWithQuestions extends Exam {
    questions: Question[];
}

export interface ExamListResponse {
    data: Exam[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const examService = {
    /**
     * Get all exams with pagination and optional courseId filter
     */
    getAll: async (
        page: number = 1,
        limit: number = 10,
        courseId?: number
    ): Promise<ExamListResponse> => {
        try {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", limit.toString());
            if (courseId) params.append("courseId", courseId.toString());

            const response = await fetch(`${API_URL}/exams?${params.toString()}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch exams");
            }

            return await response.json();
        } catch (error) {
            console.error("Get exams error:", error);
            throw error;
        }
    },

    /**
     * Get exams by course ID
     */
    getByCourse: async (courseId: number): Promise<Exam[]> => {
        try {
            const response = await fetch(`${API_URL}/exams/course/${courseId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch exams");
            }

            return await response.json();
        } catch (error) {
            console.error("Get exams by course error:", error);
            throw error;
        }
    },

    /**
     * Get exam details (preview without questions)
     */
    getById: async (id: number): Promise<Exam> => {
        try {
            const response = await fetch(`${API_URL}/exams/${id}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch exam");
            }

            return await response.json();
        } catch (error) {
            console.error("Get exam error:", error);
            throw error;
        }
    },

    /**
     * Start exam - get questions without correct answers
     */
    startExam: async (id: number): Promise<ExamWithQuestions> => {
        try {
            const response = await fetch(`${API_URL}/exams/${id}/start`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to start exam");
            }

            return await response.json();
        } catch (error) {
            console.error("Start exam error:", error);
            throw error;
        }
    },

    /**
     * Review exam - get questions with correct answers
     */
    reviewExam: async (id: number): Promise<ExamWithQuestions> => {
        try {
            const response = await fetch(`${API_URL}/exams/${id}/review`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to review exam");
            }

            return await response.json();
        } catch (error) {
            console.error("Review exam error:", error);
            throw error;
        }
    },
};
