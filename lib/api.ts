// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Helper to safely parse JSON response
export const parseResponse = async (response: Response) => {
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch {
        console.error("Response is not JSON:", text);
        return { message: text || "Server error" };
    }
};

// Get auth token from localStorage
export const getAuthToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

// Set auth token to localStorage
export const setAuthToken = (token: string): void => {
    if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
    }
};

// Remove auth token from localStorage
export const removeAuthToken = (): void => {
    if (typeof window !== "undefined") {
        localStorage.removeItem("token");
    }
};

// Create headers with auth token
export const createAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
};
