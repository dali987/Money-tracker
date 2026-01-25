import { axiosInstance } from '../axios';
import { Account } from '@/types';

const API_URL = '/account';

export const accountApi = {
    getAll: async () => {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    },

    getSummary: async () => {
        const response = await axiosInstance.get(`${API_URL}/summary`);
        return response.data;
    },

    create: async (data: Partial<Account>) => {
        const response = await axiosInstance.post(`${API_URL}/create`, data);
        return response.data;
    },

    update: async (id: string, data: Partial<Account>) => {
        const response = await axiosInstance.put(`${API_URL}/update/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(`${API_URL}/delete/${id}`);
        return response.data;
    },
};
