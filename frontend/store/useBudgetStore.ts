import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';

import { Budget } from '@/types';

interface BudgetStore {
    budgets: Budget[];
    isLoading: boolean;
    isError: boolean;
    getBudgets: () => Promise<void>;
    createBudget: (data: { tag: string; amount: number; alertThreshold?: number }) => Promise<void>;
    updateBudget: (id: string, data: { amount?: number; alertThreshold?: number }) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>((set, get) => ({
    budgets: [],
    isLoading: false,
    isError: false,

    getBudgets: async () => {
        set({ isLoading: true, isError: false });
        try {
            const res = await axiosInstance.get('/budget/');
            set({ budgets: res.data.data });
        } catch (error) {
            console.error('Error fetching budgets:', error);
            set({ isError: true });
            toast.error('Failed to fetch budgets');
        } finally {
            set({ isLoading: false });
        }
    },

    createBudget: async (data) => {
        try {
            const res = await axiosInstance.post('/budget/create', data);
            set((state) => ({ budgets: [...state.budgets, res.data.data] }));
            toast.success('Budget created successfully');
        } catch (error: any) {
            console.error('Error creating budget:', error);
            const message = error.response?.data?.message || 'Failed to create budget';
            toast.error(message);
        }
    },

    updateBudget: async (id, data) => {
        try {
            const res = await axiosInstance.put(`/budget/update/${id}`, data);
            set((state) => ({
                budgets: state.budgets.map((b) => (b._id === id ? res.data.data : b)),
            }));
            toast.success('Budget updated successfully');
        } catch (error) {
            console.error('Error updating budget:', error);
            toast.error('Failed to update budget');
        }
    },

    deleteBudget: async (id) => {
        try {
            await axiosInstance.delete(`/budget/delete/${id}`);
            set((state) => ({
                budgets: state.budgets.filter((b) => b._id !== id),
            }));
            toast.success('Budget deleted successfully');
        } catch (error) {
            console.error('Error deleting budget:', error);
            toast.error('Failed to delete budget');
        }
    },
}));
