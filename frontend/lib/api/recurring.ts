import { axiosInstance } from '../axios';
import { RecurringTransaction } from '@/types';

const API_URL = '/recurring';

export const recurringApi = {
    create: async (
        data: Partial<RecurringTransaction>,
    ): Promise<{ success: boolean; data: RecurringTransaction }> => {
        const response = await axiosInstance.post(`${API_URL}/create`, data);
        return response.data;
    },

    getAll: async (): Promise<{ success: boolean; data: RecurringTransaction[] }> => {
        const response = await axiosInstance.get(API_URL);
        return response.data;
    },

    update: async (
        id: string,
        data: Partial<RecurringTransaction>,
    ): Promise<{ success: boolean; data: RecurringTransaction }> => {
        const response = await axiosInstance.put(`${API_URL}/update/${id}`, data);
        return response.data;
    },

    delete: async (id: string): Promise<{ success: boolean }> => {
        const response = await axiosInstance.delete(`${API_URL}/delete/${id}`);
        return response.data;
    },
};
