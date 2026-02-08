import { API_URL } from "@/lib/api";

export interface Provider {
    id: number;
    name: string;
}

export interface Course {
    id: number;
    title: string;
    description: string | null;
    level: "Foundational" | "Associate" | "Professional" | "Specialty";
    thumbnailUrl: string | null;
    isActive: boolean;
    createdAt: string;
    provider: Provider;
    _count: {
        exams: number;
    };
}

export interface CourseListResponse {
    data: Course[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export const courseService = {
    /**
     * Get all courses with pagination and optional filters
     */
    getAll: async (
        page: number = 1,
        limit: number = 10,
        providerId?: number,
        level?: string,
        search?: string
    ): Promise<CourseListResponse> => {
        try {
            const params = new URLSearchParams();
            params.append("page", page.toString());
            params.append("limit", limit.toString());
            if (providerId) params.append("providerId", providerId.toString());
            if (level) params.append("level", level);
            if (search) params.append("search", search);

            const response = await fetch(`${API_URL}/courses?${params.toString()}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch courses");
            }

            return await response.json();
        } catch (error) {
            console.error("Get courses error:", error);
            throw error;
        }
    },

    /**
     * Get a single course by ID
     */
    getById: async (id: number): Promise<Course> => {
        try {
            const response = await fetch(`${API_URL}/courses/${id}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch course");
            }

            return await response.json();
        } catch (error) {
            console.error("Get course error:", error);
            throw error;
        }
    },

    /**
     * Get courses by provider ID
     */
    getByProvider: async (providerId: number): Promise<Course[]> => {
        try {
            const response = await fetch(`${API_URL}/courses/provider/${providerId}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch courses by provider");
            }

            return await response.json();
        } catch (error) {
            console.error("Get courses by provider error:", error);
            throw error;
        }
    },
};
