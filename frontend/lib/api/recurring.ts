import axios from 'axios';
import { RecurringTransaction } from '@/types';

const API_URL = '/api/v1/recurring';

export const recurringApi = {
    create: async (data: Partial<RecurringTransaction>) => {
        const response = await axios.post(`${API_URL}/create`, data);
        return response.data;
    },

    getAll: async () => {
        const response = await axios.get(API_URL);
        return response.data;
    },

    update: async (id: string, data: Partial<RecurringTransaction>) => {
        const response = await axios.put(`${API_URL}/update/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axios.delete(`${API_URL}/delete/${id}`);
        return response.data;
    },
};
