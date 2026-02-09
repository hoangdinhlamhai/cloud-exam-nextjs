import { API_URL, createAuthHeaders, getAuthToken } from "@/lib/api";

export interface ExamResultExam {
    id: number;
    title: string;
    course: {
        id: number;
        title: string;
        level: string;
    };
}

export interface ExamResult {
    id: number;
    score: number;
    correctCount: number;
    totalQuestions: number;
    completedAt: string;
    passed: boolean;
    exam: ExamResultExam;
}

export interface ExamResultDetails extends ExamResult {
    userAnswers: {
        questionId: number;
        answerId: number;
        isCorrect: boolean;
    }[];
}

export interface ExamHistoryResponse {
    data: ExamResult[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UserStats {
    totalExamsTaken: number;
    averageScore: number;
    totalCorrectAnswers: number;
    totalQuestions: number;
    passedExams: number;
    failedExams: number;
}

export interface QuestionResult {
    questionId: number;
    isCorrect: boolean;
    userAnswerId: number;
    correctAnswerId: number;
    explanation: string | null;
}

export interface ExamSubmissionResponse {
    examResultId: number;
    score: number;
    totalQuestions: number;
    correctCount: number;
    details: QuestionResult[];
}

export interface SubmitExamDto {
    examId: number;
    answers: {
        questionId: number;
        answerId: number;
    }[];
}

export const examResultService = {
    /**
     * Submit exam answers and get results
     * Requires authentication
     */
    submitExam: async (data: SubmitExamDto): Promise<ExamSubmissionResponse> => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        try {
            const response = await fetch(`${API_URL}/exam-results`, {
                method: "POST",
                headers: createAuthHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit exam");
            }

            return await response.json();
        } catch (error) {
            console.error("Submit exam error:", error);
            throw error;
        }
    },

    /**
     * Get exam history for current user
     * Requires authentication
     */
    getHistory: async (page: number = 1, limit: number = 10): Promise<ExamHistoryResponse> => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        try {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", limit.toString());

            const response = await fetch(`${API_URL}/exam-results/history?${params.toString()}`, {
                method: "GET",
                headers: createAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch history");
            }

            return await response.json();
        } catch (error) {
            console.error("Get history error:", error);
            throw error;
        }
    },

    /**
     * Get user statistics
     * Requires authentication
     */
    getUserStats: async (): Promise<UserStats> => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        try {
            const response = await fetch(`${API_URL}/exam-results/stats`, {
                method: "GET",
                headers: createAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch stats");
            }

            return await response.json();
        } catch (error) {
            console.error("Get stats error:", error);
            throw error;
        }
    },

    /**
     * Get specific exam result by ID
     * Requires authentication
     */
    getResultById: async (id: number): Promise<ExamResultDetails> => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        try {
            const response = await fetch(`${API_URL}/exam-results/${id}`, {
                method: "GET",
                headers: createAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch result");
            }

            return await response.json();
        } catch (error) {
            console.error("Get result error:", error);
            throw error;
        }
    },
};
