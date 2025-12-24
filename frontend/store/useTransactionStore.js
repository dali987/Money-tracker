import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { toast } from 'sonner';

export const useTransactionStore = create((set, get) => ({
    accounts: [],
    transactions: [],
    rates: {},

    getAccounts: async (force = false) => {
        try {
            const token = await useAuthStore.getState().getToken();

            const res = await axiosInstance.get('/account/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res) throw new Error('error getting user');

            const accounts = res.data.data;
            if (!accounts) throw new Error('error getting user');

            set({ accounts: accounts });
            return accounts;
        } catch (error) {
            console.error('An error occurred while getting accounts: ', error);
            set({ accounts: [] });
            return [];
        }
    },
    getTransactionsWithFilter: async (filters) => {
        try {
            const token = await useAuthStore.getState().getToken();

            const res = await axiosInstance.get('/transaction/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: filters,
            });
            if (!res) throw new Error('error getting user');

            const transactions = res.data.data;
            if (!transactions) throw new Error('error getting user');

            const sortedTransactions = transactions.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );

            set({ transactions: sortedTransactions });
            return transactions;
        } catch (error) {
            console.error('An error occurred while getting accounts: ', error);
            set({ transactions: [] });
            return [];
        }
    },
    createTransaction: async (transactionData) => {
        try {
            const token = await useAuthStore.getState().getToken();

            const res = await axiosInstance.post('/transaction/create', transactionData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res) throw new Error('error creating transaction');

            const transaction = res.data.data;
            if (!transaction) throw new Error('error creating transaction');

            toast.success('Transaction successfully created');

            const transactions = [...get().transactions, transaction];

            const sortedTransactions = transactions.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );

            set({ transactions: sortedTransactions });
        } catch (error) {
            console.error('An error occurred while creating transaction: ', error);
            toast.error('something went wrong');
        }
    },

    updateTransaction: async (transactionData) => {
        try {
            const token = await useAuthStore.getState().getToken();

            const res = await axiosInstance.put(
                `/transaction/update/${transactionData.id}`,
                transactionData.data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!res) throw new Error('error updating the transaction');

            const transaction = res.data.data;
            if (!transaction) throw new Error('error updating the transaction');

            toast.success('Transaction successfully created');

            const transactions = get().transactions.map((item) =>
                item._id === transaction._id ? transaction : item
            );

            set({ transactions: transactions });
        } catch (error) {
            console.error('An error occurred while creating transaction: ', error);
            toast.error('Something went wrong');
        }
    },

    deleteTransaction: async (transactionId) => {
        try {
            const token = await useAuthStore.getState().getToken();

            const res = await axiosInstance.delete(`/transaction/delete/${transactionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res) throw new Error('error deleting transaction');

            const deletedTransaction = res.data.data;
            if (!deletedTransaction) throw new Error('error deleting transaction');

            toast.success('Transaction deleted successfully');

            const transactions = get().transactions.filter(
                (item) => item._id !== deletedTransaction._id
            );

            set({ transactions: transactions });
        } catch (error) {
            console.error('An error occurred while deleting the transaction: ', error);
            toast.error('Something went wrong');
        }
    },
    getRates: async () => {
        try {
            const token = await useAuthStore.getState().getToken();

            const res = await axiosInstance.get('/exchange/', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res) throw new Error('error getting rates');

            const rates = res.data.data.rates;
            if (!rates) throw new Error('error getting rates');

            set({ rates: rates });
            return rates;
        } catch (error) {
            console.error('An error occurred while getting rates: ', error);
            set({ rates: [] });
            return [];
        }
    },
}));
