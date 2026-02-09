import { API_URL, createAuthHeaders, getAuthToken } from "@/lib/api";

export interface Note {
    id: number;
    userId: number;
    courseId?: number;
    questionId?: number;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateNoteDto {
    content: string;
    courseId?: number;
    questionId?: number;
}

export const noteService = {
    /**
     * Create a new note
     * Requires authentication
     */
    createNote: async (data: CreateNoteDto): Promise<Note> => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        try {
            const response = await fetch(`${API_URL}/notes`, {
                method: "POST",
                headers: createAuthHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create note");
            }

            return await response.json();
        } catch (error) {
            console.error("Create note error:", error);
            throw error;
        }
    },

    /**
     * Get all notes for a course
     * Requires authentication
     */
    getNotesByCourse: async (courseId: number): Promise<Note[]> => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        try {
            const response = await fetch(`${API_URL}/notes/${courseId}`, {
                method: "GET",
                headers: createAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch notes");
            }

            return await response.json();
        } catch (error) {
            console.error("Get notes error:", error);
            throw error;
        }
    },

    /**
     * Get all notes for a question
     * Requires authentication
     */
    getNotesByQuestion: async (questionId: number): Promise<Note[]> => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        try {
            const response = await fetch(`${API_URL}/notes/${questionId}`, {
                method: "GET",
                headers: createAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch notes");
            }

            return await response.json();
        } catch (error) {
            console.error("Get notes error:", error);
            throw error;
        }
    },

    /**
     * Delete a note
     * Requires authentication
     */
    deleteNote: async (id: number): Promise<void> => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("Authentication required");
        }

        try {
            const response = await fetch(`${API_URL}/notes/${id}`, {
                method: "DELETE",
                headers: createAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to delete note");
            }
        } catch (error) {
            console.error("Delete note error:", error);
            throw error;
        }
    },

    /**
     * Get all notes for current user (all courses)
     * This is a client-side aggregation since backend doesn't have this endpoint
     */
    getAllNotes: async (): Promise<Note[]> => {
        // Note: Backend doesn't have a direct endpoint to get all notes
        // This would need to be implemented on backend or done differently
        throw new Error("Not implemented - requires backend endpoint");
    },
};
