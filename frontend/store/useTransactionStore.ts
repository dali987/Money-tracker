import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import {
    Account,
    Transaction,
    Rates,
    CurrencyOption,
    MultiCurrencySummary,
    TransactionSummary,
} from '@/types';

interface TransactionStore {
    accounts: Account[];
    transactions: Transaction[];
    rates: Rates;
    currencies: CurrencyOption[];
    isTransactionsLoading: boolean;
    isAccountsLoading: boolean;
    isTransactionsError: boolean;
    isAccountsError: boolean;

    getAccounts: (force?: boolean) => Promise<Account[]>;
    createAccount: (accountData: any) => Promise<void>;
    updateAccount: (accountData: { id: string; data: Partial<Account> }) => Promise<void>;
    deleteAccount: (accountId: string) => Promise<void>;
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
    getAccountsSummary: () => Promise<MultiCurrencySummary | null>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
    accounts: [],
    transactions: [],
    rates: {},
    currencies: [],
    isTransactionsLoading: false,
    isAccountsLoading: false,
    isTransactionsError: false,
    isAccountsError: false,

    getAccounts: async () => {
        set({ isAccountsLoading: true, isAccountsError: false });
        try {
            const res = await axiosInstance.get('/account/');
            if (!res) throw new Error('error getting accounts');

            const accounts = res.data.data;
            if (!accounts) throw new Error('error getting accounts');

            set({ accounts: accounts });
            get().getAccountsSummary();
            return accounts;
        } catch (error) {
            console.error('An error occurred while getting accounts: ', error);
            set({ accounts: [], isAccountsError: true });
            return [];
        } finally {
            set({ isAccountsLoading: false });
        }
    },

    createAccount: async (accountData) => {
        try {
            const res = await axiosInstance.post('/account/create', accountData);
            if (!res) throw new Error('error creating account');

            const account = res.data.data;
            if (!account) throw new Error('error creating account');

            toast.success('Account successfully created');
            set((state) => ({ accounts: [...state.accounts, account] }));
        } catch (error) {
            console.error('An error occurred while creating account: ', error);
            toast.error('Something went wrong');
        }
    },

    updateAccount: async ({ id, data }) => {
        try {
            const res = await axiosInstance.put(`/account/update/${id}`, data);
            if (!res) throw new Error('error updating the account');

            const account = res.data.data;
            if (!account) throw new Error('error updating the account');

            toast.success('Account successfully updated');
            set((state) => ({
                accounts: state.accounts.map((item) => (item._id === account._id ? account : item)),
            }));
        } catch (error) {
            console.error('An error occurred while updating account: ', error);
            toast.error('Something went wrong');
        }
    },

    deleteAccount: async (accountId) => {
        try {
            const res = await axiosInstance.delete(`/account/delete/${accountId}`);
            if (!res) throw new Error('error deleting account');

            const deletedAccount = res.data.data;
            if (!deletedAccount) throw new Error('error deleting account');

            toast.success('Account deleted successfully');
            set((state) => ({
                accounts: state.accounts.filter((item) => item._id !== deletedAccount._id),
            }));
            get().getAccountsSummary();
        } catch (error) {
            console.error('An error occurred while deleting the account: ', error);
            toast.error('Something went wrong');
        }
    },

    getTransactionsWithFilter: async (filters) => {
        set({ isTransactionsLoading: true, isTransactionsError: false });
        try {
            const res = await axiosInstance.get('/transaction/', { params: filters });
            if (!res) throw new Error('error getting transactions');

            const transactions = res.data.data as Transaction[];
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
            const res = await axiosInstance.get('/transaction/summary', { params: filters });
            return res.data.data;
        } catch (error) {
            console.error('An error occurred while getting transactions summary: ', error);
            return null;
        }
    },

    getTransactionsChart: async (filters) => {
        try {
            const res = await axiosInstance.get('/transaction/chart', { params: filters });
            return res.data.data;
        } catch (error) {
            console.error('An error occurred while getting chart data: ', error);
            return [];
        }
    },

    getNetWorthChart: async (filters) => {
        try {
            const res = await axiosInstance.get('/transaction/net-worth-chart', {
                params: filters,
            });
            return res.data.data;
        } catch (error) {
            console.error('An error occurred while getting net worth chart data: ', error);
            return null;
        }
    },

    createTransaction: async (transactionData) => {
        try {
            const res = await axiosInstance.post('/transaction/create', transactionData);
            if (!res) throw new Error('error creating transaction');

            const transaction = res.data.data;
            toast.success('Transaction successfully created');

            set((state) => {
                const newTransactions = [...state.transactions, transaction].sort(
                    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
                );
                return { transactions: newTransactions };
            });
            get().getAccounts();
        } catch (error) {
            console.error('An error occurred while creating transaction: ', error);
            toast.error('Something went wrong');
        }
    },

    updateTransaction: async ({ id, data }) => {
        try {
            const res = await axiosInstance.put(`/transaction/update/${id}`, data);
            if (!res) throw new Error('error updating the transaction');

            const transaction = res.data.data;
            toast.success('Transaction successfully updated');

            set((state) => ({
                transactions: state.transactions.map((item) =>
                    item._id === transaction._id ? transaction : item,
                ),
            }));
            get().getAccounts();
        } catch (error) {
            console.error('An error occurred while updating transaction: ', error);
            toast.error('Something went wrong');
        }
    },

    deleteTransaction: async (transactionId) => {
        try {
            const res = await axiosInstance.delete(`/transaction/delete/${transactionId}`);
            const deletedTransaction = res.data.data;

            toast.success('Transaction deleted successfully');
            set((state) => ({
                transactions: state.transactions.filter(
                    (item) => item._id !== deletedTransaction._id,
                ),
            }));
            get().getAccounts();
        } catch (error) {
            console.error('An error occurred while deleting the transaction: ', error);
            toast.error('Something went wrong');
        }
    },

    getRates: async () => {
        try {
            const res = await axiosInstance.get('/exchange/');
            const rates = res.data.data.rates;
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
            const res = await axiosInstance.get('/exchange/currencies');
            const currencies = res.data.data;
            set({ currencies });
            return currencies;
        } catch (error) {
            console.error('An error occurred while getting currencies: ', error);
            set({ currencies: [] });
            return [];
        }
    },

    getAccountsSummary: async () => {
        try {
            const res = await axiosInstance.get('/account/summary');
            return res.data.data;
        } catch (error) {
            console.error('An error occurred while getting account summary: ', error);
            return null;
        }
    },
}));
