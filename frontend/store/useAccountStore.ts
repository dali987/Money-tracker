import { create } from 'zustand';
import { toast } from 'sonner';
import { accountApi } from '@/lib/api/accounts';
import { Account, AccountSummary } from '@/types';

interface AccountStore {
    accounts: Account[];
    isLoading: boolean;
    isError: boolean;

    // Actions
    getAccounts: (force?: boolean) => Promise<Account[]>;
    createAccount: (accountData: any) => Promise<void>;
    updateAccount: (accountData: { id: string; data: Partial<Account> }) => Promise<void>;
    deleteAccount: (accountId: string) => Promise<void>;
    getAccountsSummary: () => Promise<AccountSummary | null>;
}

export const useAccountStore = create<AccountStore>((set, get) => ({
    accounts: [],
    isLoading: false,
    isError: false,

    getAccounts: async () => {
        set({ isLoading: true, isError: false });
        try {
            const data = await accountApi.getAll();
            if (!data.data) throw new Error('error getting accounts');

            const accounts = data.data;

            set({ accounts: accounts });
            // Fetch summary whenever accounts are fetched to keep them in sync
            // Note: In an optimized app, we might want to separate these calls
            get().getAccountsSummary();
            return accounts;
        } catch (error) {
            console.error('An error occurred while getting accounts: ', error);
            set({ accounts: [], isError: true });
            return [];
        } finally {
            set({ isLoading: false });
        }
    },

    createAccount: async (accountData) => {
        try {
            const data = await accountApi.create(accountData);
            if (!data) throw new Error('error creating account');

            const account = data.data;
            if (!account) throw new Error('error creating account');

            toast.success('Account successfully created');
            set((state) => ({ accounts: [...state.accounts, account] }));
            get().getAccountsSummary(); // Refresh summary
        } catch (error) {
            console.error('An error occurred while creating account: ', error);
            toast.error('Something went wrong');
        }
    },

    updateAccount: async ({ id, data }) => {
        try {
            const response = await accountApi.update(id, data);
            if (!response) throw new Error('error updating the account');

            const account = response.data;
            if (!account) throw new Error('error updating the account');

            toast.success('Account successfully updated');
            set((state) => ({
                accounts: state.accounts.map((item) => (item._id === account._id ? account : item)),
            }));
            get().getAccountsSummary(); // Refresh summary
        } catch (error) {
            console.error('An error occurred while updating account: ', error);
            toast.error('Something went wrong');
        }
    },

    deleteAccount: async (accountId) => {
        try {
            const data = await accountApi.delete(accountId);
            if (!data) throw new Error('error deleting account');

            const deletedAccount = data.data;
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

    getAccountsSummary: async () => {
        try {
            const data = await accountApi.getSummary();
            return data.data;
        } catch (error) {
            console.error('An error occurred while getting account summary: ', error);
            return null;
        }
    },
}));
