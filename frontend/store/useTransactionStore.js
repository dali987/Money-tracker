import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { toast } from 'sonner';
import { filter } from 'lodash';

export const useTransactionStore = create((set, get) => ({
    accounts: [],
    transactions: [],
    rates: {},
    currencies: [],
    isTransactionsLoading: false,
    isAccountsLoading: false,

    getAccounts: async (force = false) => {
        set({ isAccountsLoading: true });
        try {
            const res = await axiosInstance.get('/account/');
            if (!res) throw new Error('error getting user');

            const accounts = res.data.data;
            if (!accounts) throw new Error('error getting user');

            set({ accounts: accounts });
            get().getAccountsSummary();
            return accounts;
        } catch (error) {
            console.error('An error occurred while getting accounts: ', error);
            set({ accounts: [] });
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

            const accounts = [...get().accounts, account];

            set({ accounts: accounts });
        } catch (error) {
            console.error('An error occurred while creating account: ', error);
            toast.error('Something went wrong');
        }
    },
    updateAccount: async (accountData) => {
        try {
            const res = await axiosInstance.put(
                `/account/update/${accountData.id}`,
                accountData.data
            );
            if (!res) throw new Error('error updating the account');

            const account = res.data.data;
            if (!account) throw new Error('error updating the account');

            toast.success('Account successfully updated');

            const accounts = get().accounts.map((item) =>
                item._id === account._id ? account : item
            );

            set({ accounts: accounts });
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

            const accounts = get().accounts.filter((item) => item._id !== deletedAccount._id);

            set({ accounts: accounts });
            get().getAccountsSummary();
        } catch (error) {
            console.error('An error occurred while deleting the account: ', error);
            toast.error('Something went wrong');
        }
    },
    getTransactionsWithFilter: async (filters) => {
        set({ isTransactionsLoading: true });
        try {
            const res = await axiosInstance.get('/transaction/', {
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
            console.error('An error occurred while getting transactions: ', error);
            set({ transactions: [] });
            return [];
        } finally {
            set({ isTransactionsLoading: false });
        }
    },
    getTransactionsSummary: async (filters) => {
        try {
            const res = await axiosInstance.get('/transaction/summary', {
                params: filters,
            });
            if (!res) throw new Error('error getting user');

            const summary = res.data.data;
            if (!summary) throw new Error('error getting user');

            return summary;
        } catch (error) {
            console.error('An error occurred while getting accounts: ', error);
            return null;
        }
    },
    getTransactionsChart: async (filters) => {
        try {
            const res = await axiosInstance.get('/transaction/chart', {
                params: filters,
            });
            if (!res) throw new Error('error getting chart data');

            const data = res.data.data;
            return data;
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
            if (!res) throw new Error('error getting net worth chart data');

            const data = res.data.data;
            return data;
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
            if (!transaction) throw new Error('error creating transaction');

            toast.success('Transaction successfully created');

            const transactions = [...get().transactions, transaction];

            const sortedTransactions = transactions.sort(
                (a, b) => new Date(b.date) - new Date(a.date)
            );

            set({ transactions: sortedTransactions });
            get().getAccounts();
        } catch (error) {
            console.error('An error occurred while creating transaction: ', error);
            toast.error('something went wrong');
        }
    },

    updateTransaction: async (transactionData) => {
        try {
            const res = await axiosInstance.put(
                `/transaction/update/${transactionData.id}`,
                transactionData.data
            );
            if (!res) throw new Error('error updating the transaction');

            const transaction = res.data.data;
            if (!transaction) throw new Error('error updating the transaction');

            toast.success('Transaction successfully created');

            const transactions = get().transactions.map((item) =>
                item._id === transaction._id ? transaction : item
            );

            set({ transactions: transactions });
            get().getAccounts();
        } catch (error) {
            console.error('An error occurred while creating transaction: ', error);
            toast.error('Something went wrong');
        }
    },

    deleteTransaction: async (transactionId) => {
        try {
            const res = await axiosInstance.delete(`/transaction/delete/${transactionId}`);
            if (!res) throw new Error('error deleting transaction');

            const deletedTransaction = res.data.data;
            if (!deletedTransaction) throw new Error('error deleting transaction');

            toast.success('Transaction deleted successfully');

            const transactions = get().transactions.filter(
                (item) => item._id !== deletedTransaction._id
            );

            set({ transactions: transactions });
            get().getAccounts();
        } catch (error) {
            console.error('An error occurred while deleting the transaction: ', error);
            toast.error('Something went wrong');
        }
    },
    getRates: async () => {
        try {
            const res = await axiosInstance.get('/exchange/');
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
    getCurrencies: async () => {
        try {
            const res = await axiosInstance.get('/exchange/currencies');
            if (!res) throw new Error('error getting currencies');

            const currencies = res.data.data;
            if (!currencies) throw new Error('error getting currencies');

            set({ currencies: currencies });
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
            if (!res) throw new Error('error getting account summary');

            const summary = res.data.data;
            if (!summary) throw new Error('error getting account summary');

            return summary;
        } catch (error) {
            console.error('An error occurred while getting account summary: ', error);
            return null;
        }
    },
}));
