import { axiosInstance } from '../axios';
import { Budget } from '@/types';

const API_URL = '/budget';

export const budgetApi = {
    getAll: async () => {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    },

    create: async (data: Partial<Budget>) => {
        const response = await axiosInstance.post(`${API_URL}/create`, data);
        return response.data;
    },

    update: async (id: string, data: Partial<Budget>) => {
        const response = await axiosInstance.put(`${API_URL}/update/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(`${API_URL}/delete/${id}`);
        return response.data;
    },
};
