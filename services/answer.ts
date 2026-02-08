import { API_URL } from "@/lib/api";

export interface Answer {
    id: number;
    questionId: number;
    content: string;
    isCorrect?: boolean;
}

export const answerService = {
    /**
     * Get all answers by question ID
     * @param questionId - Question ID
     * @param showCorrect - If true, includes isCorrect field
     */
    getByQuestion: async (questionId: number, showCorrect: boolean = false): Promise<Answer[]> => {
        try {
            const response = await fetch(
                `${API_URL}/answers/question/${questionId}?showCorrect=${showCorrect}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch answers");
            }

            return await response.json();
        } catch (error) {
            console.error("Get answers error:", error);
            throw error;
        }
    },

    /**
     * Get a single answer by ID
     */
    getById: async (id: number): Promise<Answer> => {
        try {
            const response = await fetch(`${API_URL}/answers/${id}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch answer");
            }

            return await response.json();
        } catch (error) {
            console.error("Get answer error:", error);
            throw error;
        }
    },

    /**
     * Get correct answer for a question
     */
    getCorrectAnswer: async (questionId: number): Promise<Answer | null> => {
        try {
            const response = await fetch(`${API_URL}/answers/correct/${questionId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch correct answer");
            }

            return await response.json();
        } catch (error) {
            console.error("Get correct answer error:", error);
            throw error;
        }
    },
};
