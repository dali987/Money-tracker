import { axiosInstance } from '../axios';
import { Transaction, TransactionFilter } from '@/types';

const API_URL = '/transaction';

export const transactionApi = {
    getAll: async (filters?: TransactionFilter) => {
        const response = await axiosInstance.get(API_URL, { params: filters });
        return response.data;
    },

    getSummary: async (filters?: TransactionFilter) => {
        const response = await axiosInstance.get(`${API_URL}/summary`, { params: filters });
        return response.data;
    },

    getChart: async (filters?: TransactionFilter) => {
        const response = await axiosInstance.get(`${API_URL}/chart`, { params: filters });
        return response.data;
    },

    getNetWorthChart: async (filters?: TransactionFilter) => {
        const response = await axiosInstance.get(`${API_URL}/net-worth-chart`, { params: filters });

        return response.data;
    },

    create: async (data: Partial<Transaction>) => {
        const response = await axiosInstance.post(`${API_URL}/create`, data);
        return response.data;
    },

    update: async (id: string, data: Partial<Transaction>) => {
        const response = await axiosInstance.put(`${API_URL}/update/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(`${API_URL}/delete/${id}`);
        return response.data;
    },
};
