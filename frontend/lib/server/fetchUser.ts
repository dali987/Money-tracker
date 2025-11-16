import { axiosInstance } from '@/lib/axios.js';
import { toast } from 'sonner';

export const getToken = async () => {
    try {
        const tokenRes = await axiosInstance.get('/auth/token', {
            withCredentials: true,
        });
        if (!tokenRes) throw new Error('error getting token');

        const accessToken = tokenRes?.data?.data;

        if (!accessToken) throw new Error('error getting token');

        return accessToken;
    } catch (error) {
        console.log('error while getting the token: ', error);
        toast.error('Something went wrong');

        return null;
    }
};

export const getUser = async () => {
    try {
        const token = await getToken();

        const res = await axiosInstance.get('/user/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res) throw new Error('error getting user');

        const user = res.data.data;
        if (!user) throw new Error('error getting user');

        return user;
    } catch (error) {
        console.log('error while getting the user: ', error);
        toast.error('Something went wrong');

        return null;
    }
}

export const getAccounts = async () => {
    try {
        const token = await getToken();

        const res = await axiosInstance.get('/account/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res) throw new Error('error getting accounts');

        const accounts = res.data.data;
        if (!accounts) throw new Error('error getting accounts');

        return accounts
    } catch (error) {
        console.log("error while getting the accounts: ", error);
        toast.error("Something went wrong")
    }
}

export const getTransactions = async () => {
    try {
        const token = await getToken();

        const res = await axiosInstance.get('/transaction/', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res) throw new Error('error getting transaction');

        const transactions = res.data.data;
        if (!transactions) throw new Error('error getting transaction');

        return transactions
    } catch (error) {
        console.log("error while getting the transactions: ", error);
        toast.error("Something went wrong")
    }
}