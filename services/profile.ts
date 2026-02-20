import { API_URL, getAuthToken } from "@/lib/api";

export const profileService = {
    getProfile: async () => {
        const token = getAuthToken();
        try {
            const res = await fetch(`${API_URL}/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error("Failed to fetch profile");
            }
            return await res.json();
        } catch (error) {
            console.error("Get profile error:", error);
            throw error;
        }
    },

    /**
     * Get user statistics
     * GET /api/exam-results/stats
     */
    getStats: async () => {
        const token = getAuthToken();
        try {
            const res = await fetch(`${API_URL}/exam-results/stats`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error("Failed to fetch stats");
            }
            return await res.json();
        } catch (error) {
            console.error("Get stats error:", error);
            throw error;
        }
    },

    updateProfile: async (data: any) => {
        const token = getAuthToken();
        try {
            const res = await fetch(`${API_URL}/profile`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to update profile");
            }
            return await res.json();
        } catch (error) {
            console.error("Update profile error:", error);
            throw error;
        }
    },

    /**
     * Upload avatar image to R2
     * POST /api/profile/avatar (multipart/form-data, field: "file")
     */
    uploadAvatar: async (file: File) => {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API_URL}/profile/avatar`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                    // Không set Content-Type — browser tự thêm boundary cho multipart
                },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to upload avatar");
            }
            return await res.json();
        } catch (error) {
            console.error("Upload avatar error:", error);
            throw error;
        }
    },

    /**
     * Delete avatar image from R2
     * DELETE /api/profile/avatar
     */
    deleteAvatar: async () => {
        const token = getAuthToken();
        try {
            const res = await fetch(`${API_URL}/profile/avatar`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to delete avatar");
            }
            return await res.json();
        } catch (error) {
            console.error("Delete avatar error:", error);
            throw error;
        }
    }
};