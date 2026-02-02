import { create } from 'zustand';
import { toast } from 'sonner';
import { budgetApi } from '@/lib/api/budget';
import { Budget } from '@/types';
import { AxiosError } from 'axios';

interface BudgetStore {
    budgets: Budget[];
    isLoading: boolean;
    isError: boolean;
    getBudgets: () => Promise<void>;
    createBudget: (data: { tag: string; amount: number; alertThreshold?: number }) => Promise<void>;
    updateBudget: (id: string, data: { amount?: number; alertThreshold?: number }) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
}

export const useBudgetStore = create<BudgetStore>((set) => ({
    budgets: [],
    isLoading: false,
    isError: false,

    getBudgets: async () => {
        set({ isLoading: true, isError: false });
        try {
            const data = await budgetApi.getAll();
            set({ budgets: data.data });
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
            const response = await budgetApi.create(data);
            set((state) => ({ budgets: [...state.budgets, response.data] }));
            toast.success('Budget created successfully');
        } catch (error) {
            console.error('Error creating budget:', error);
            if (error instanceof AxiosError) {
                const message = error.response?.data?.message || 'Failed to create budget';
                toast.error(message);
            } else {
                toast.error('Failed to create budget');
            }
        }
    },

    updateBudget: async (id, data) => {
        try {
            const response = await budgetApi.update(id, data);
            set((state) => ({
                budgets: state.budgets.map((b) => (b._id === id ? response.data : b)),
            }));
            toast.success('Budget updated successfully');
        } catch (error) {
            console.error('Error updating budget:', error);
            toast.error('Failed to update budget');
        }
    },

    deleteBudget: async (id) => {
        try {
            await budgetApi.delete(id);
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
