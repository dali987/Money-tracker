import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios.js';
import { add } from 'lodash';

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,
    token: null,

    getToken: async () => {
        if (get().token) return get().token;

        try {
            const res = await axiosInstance.get('/auth/token', { withCredentials: true });
            if (!res) throw new Error('error getting token');

            const accessToken = res?.data?.data;

            if (!accessToken) throw new Error('error getting token');

            set({ token: accessToken });

            return accessToken;
        } catch (error) {
            console.error('An error occurred while getting token: ', error);
            set({ token: null });
            return null;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true });
        if (get().authUser) {
            set({ isCheckingAuth: false });
            return get().authUser;
        }

        try {
            const res = await axiosInstance.get('/user/');

            if (!res) throw new Error('error getting user');

            const user = res.data.data;
            if (!user) throw new Error('error getting user');

            set({ authUser: user });
        } catch (error) {
            console.error('An error occurred while checking auth: ', error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    updateSetting: async (key, setting) => {
        try {
            const res = await axiosInstance.post('/user/update', { key, setting });

            if (!res) throw new Error('error updating setting');

            const updatedSetting = res.data.data;

            const user = get().authUser;
            if (!user) throw new Error('error updating setting');

            const newUser = { ...user, [key]: updatedSetting };

            set({ authUser: newUser });
            return newUser;
        } catch (error) {
            console.error('An error occurred while updating setting: ', error);
            return null;
        }
    },
    addSetting: async (key, setting) => {
        try {
            const res = await axiosInstance.post('/user/add', { key, setting });

            if (!res) throw new Error('error adding setting');

            const updatedSetting = res.data.data;

            const user = get().authUser;
            if (!user) throw new Error('error adding setting');

            const newUser = { ...user, [key]: updatedSetting };

            set({ authUser: newUser });
            return newUser;
        } catch (error) {
            console.error('An error occurred while adding setting: ', error);
            return null;
        }
    },
    removeSetting: async (key, setting) => {
        try {
            const res = await axiosInstance.post('/user/remove', { key, setting });

            if (!res) throw new Error('error removing setting');

            const updatedSetting = res.data.data;

            const user = get().authUser;
            if (!user) throw new Error('error removing setting');

            const newUser = { ...user, [key]: updatedSetting };

            set({ authUser: newUser });
            return newUser;
        } catch (error) {
            console.error('An error occurred while removing setting: ', error);
            return null;
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/sign-out');
        } catch (error) {
            console.error('Error signing out:', error);
        }
        set({ authUser: null, token: null });
    },
}));
