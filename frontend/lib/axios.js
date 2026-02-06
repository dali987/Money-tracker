import axios from 'axios';
import { toast } from 'sonner';

export const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api/v1' : '/api/v1',
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            console.error('Session expired or invalid');
        }

        if (error.response?.status === 429) {
            const message = error.response.data?.message || 'Too many requests. Please slow down.';
            toast.error(message);
        }

        return Promise.reject(error);
    },
);
