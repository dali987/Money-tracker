import axios from 'axios';

/**
 * Axios instance configured for the money tracker API.
 *
 * Better Auth handles authentication via HTTP-only cookies automatically,
 * so we just need to ensure credentials are included in requests.
 */
export const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api/v1' : '/api/v1',
    withCredentials: true, // Required for Better Auth session cookies
});

/**
 * Response interceptor for handling authentication errors.
 *
 * If the server returns 401, the session has expired or is invalid.
 * Better Auth handles session refresh automatically via cookies,
 * so we just need to handle the case where the session is truly invalid.
 */
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Avoid infinite loops by checking if we've already retried
        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            // Better Auth should have automatically refreshed the session
            // If we still get 401, the session is truly invalid
            // Redirect to login (handled by the calling component)
            console.error('Session expired or invalid');
        }

        return Promise.reject(error);
    }
);
