import { create } from 'zustand';
import { toast } from 'sonner';
import { transactionApi } from '@/lib/api/transactions';
import { exchangeApi } from '@/lib/api/exchange';
import { useAccountStore } from './useAccountStore';

import { Transaction, Rates, CurrencyOption, TransactionSummary } from '@/types';

interface TransactionStore {
    transactions: Transaction[];
    rates: Rates;
    currencies: CurrencyOption[];
    isTransactionsLoading: boolean;
    isTransactionsError: boolean;

    getTransactionsWithFilter: (filters: any) => Promise<Transaction[]>;
    getTransactionsSummary: (filters: any) => Promise<TransactionSummary | null>;
    getTransactionsChart: (filters: any) => Promise<any[]>;
    getNetWorthChart: (filters: any) => Promise<any>;
    createTransaction: (transactionData: any) => Promise<void>;
    updateTransaction: (transactionData: {
        id: string;
        data: Partial<Transaction>;
    }) => Promise<void>;
    deleteTransaction: (transactionId: string) => Promise<void>;
    getRates: () => Promise<Rates>;
    getCurrencies: () => Promise<CurrencyOption[]>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
    transactions: [],
    rates: {},
    currencies: [],
    isTransactionsLoading: false,
    isTransactionsError: false,

    getTransactionsWithFilter: async (filters) => {
        set({ isTransactionsLoading: true, isTransactionsError: false });
        try {
            const data = await transactionApi.getAll(filters);
            if (!data) throw new Error('error getting transactions');

            const transactions = data.data as Transaction[];
            const sortedTransactions = [...transactions].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );

            set({ transactions: sortedTransactions });
            return sortedTransactions;
        } catch (error) {
            console.error('An error occurred while getting transactions: ', error);
            set({ transactions: [], isTransactionsError: true });
            return [];
        } finally {
            set({ isTransactionsLoading: false });
        }
    },

    getTransactionsSummary: async (filters) => {
        try {
            const data = await transactionApi.getSummary(filters);
            return data.data;
        } catch (error) {
            console.error('An error occurred while getting transactions summary: ', error);
            return null;
        }
    },

    getTransactionsChart: async (filters) => {
        try {
            const data = await transactionApi.getChart(filters);
            return data.data;
        } catch (error) {
            console.error('An error occurred while getting chart data: ', error);
            return [];
        }
    },

    getNetWorthChart: async (filters) => {
        try {
            const data = await transactionApi.getNetWorthChart(filters);
            return data.data;
        } catch (error) {
            console.error('An error occurred while getting net worth chart data: ', error);
            return null;
        }
    },

    createTransaction: async (transactionData) => {
        try {
            const data = await transactionApi.create(transactionData);
            if (!data) throw new Error('error creating transaction');

            const transaction = data.data;
            toast.success('Transaction successfully created');

            set((state) => {
                const newTransactions = [...state.transactions, transaction].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
                );
                return { transactions: newTransactions };
            });
            // Refresh accounts using the new store
            useAccountStore.getState().getAccounts();
        } catch (error) {
            console.error('An error occurred while creating transaction: ', error);
            toast.error('Something went wrong');
        }
    },

    updateTransaction: async ({ id, data }) => {
        try {
            const response = await transactionApi.update(id, data);
            if (!response) throw new Error('error updating the transaction');

            const transaction = response.data;
            toast.success('Transaction successfully updated');

            set((state) => ({
                transactions: state.transactions.map((item) =>
                    item._id === transaction._id ? transaction : item,
                ),
            }));
            // Refresh accounts using the new store
            useAccountStore.getState().getAccounts();
        } catch (error) {
            console.error('An error occurred while updating transaction: ', error);
            toast.error('Something went wrong');
        }
    },

    deleteTransaction: async (transactionId) => {
        try {
            const data = await transactionApi.delete(transactionId);
            const deletedTransaction = data.data;

            toast.success('Transaction deleted successfully');
            set((state) => ({
                transactions: state.transactions.filter(
                    (item) => item._id !== deletedTransaction._id,
                ),
            }));
            useAccountStore.getState().getAccounts();
        } catch (error) {
            console.error('An error occurred while deleting the transaction: ', error);
            toast.error('Something went wrong');
        }
    },

    getRates: async () => {
        try {
            const data = await exchangeApi.getRates();
            const rates = data.data.rates;
            set({ rates });
            return rates;
        } catch (error) {
            console.error('An error occurred while getting rates: ', error);
            set({ rates: {} });
            return {};
        }
    },

    getCurrencies: async () => {
        try {
            const data = await exchangeApi.getCurrencies();
            const currencies = data.data;
            set({ currencies });
            return currencies;
        } catch (error) {
            console.error('An error occurred while getting currencies: ', error);
            set({ currencies: [] });
            return [];
        }
    },
}));
