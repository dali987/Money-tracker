import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:3000/api/v1' : '/api/v1',
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    async (config) => {
        // Skip adding token for the refresh token and public auth endpoints
        const publicEndpoints = ['/auth/token', '/auth/sign-in', '/auth/sign-up'];
        if (publicEndpoints.some((endpoint) => config.url.includes(endpoint))) {
            return config;
        }

        const { useAuthStore } = await import('../store/useAuthStore.js');
        const token = await useAuthStore.getState().getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest.url.includes('/auth/token') || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axiosInstance.get('/auth/token');
                const newToken = res.data.data;

                const { useAuthStore } = await import('../store/useAuthStore.js');
                useAuthStore.setState({ token: newToken });

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // If refresh fails, log out the user
                const { useAuthStore } = await import('../store/useAuthStore.js');
                useAuthStore.getState().logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
