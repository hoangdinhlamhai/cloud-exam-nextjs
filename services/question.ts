import { API_URL } from "@/lib/api";

export interface Answer {
    id: number;
    content: string;
    isCorrect?: boolean;
}

export interface Question {
    id: number;
    examId: number;
    content: string;
    explanation: string | null;
    createdAt: string;
    answers: Answer[];
}

export interface CheckAnswerResponse {
    isCorrect: boolean;
    correctAnswerId: number;
    explanation: string | null;
}

export const questionService = {
    /**
     * Get all questions by exam ID
     * @param examId - Exam ID
     * @param showAnswers - If true, includes isCorrect field in answers
     */
    getByExam: async (examId: number, showAnswers: boolean = false): Promise<Question[]> => {
        try {
            const response = await fetch(
                `${API_URL}/questions/exam/${examId}?showAnswers=${showAnswers}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch questions");
            }

            return await response.json();
        } catch (error) {
            console.error("Get questions error:", error);
            throw error;
        }
    },

    /**
     * Get a single question by ID
     * @param id - Question ID
     * @param showAnswers - If true, includes isCorrect field in answers
     */
    getById: async (id: number, showAnswers: boolean = false): Promise<Question> => {
        try {
            const response = await fetch(
                `${API_URL}/questions/${id}?showAnswers=${showAnswers}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch question");
            }

            return await response.json();
        } catch (error) {
            console.error("Get question error:", error);
            throw error;
        }
    },

    /**
     * Check answer for a question
     * @param questionId - Question ID
     * @param answerId - Selected answer ID
     * @returns { isCorrect, correctAnswerId, explanation }
     */
    checkAnswer: async (questionId: number, answerId: number): Promise<CheckAnswerResponse> => {
        try {
            const response = await fetch(`${API_URL}/questions/${questionId}/check`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ answerId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to check answer");
            }

            return await response.json();
        } catch (error) {
            console.error("Check answer error:", error);
            throw error;
        }
    },
};
