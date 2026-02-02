import { create } from 'zustand';
import { authClient } from '@/lib/auth-client';

import { User } from '@/types';
import { userApi } from '@/lib/api/user';

interface AuthState {
    authUser: User | null;
    isCheckingAuth: boolean;
    isSigningUp: boolean;
    isLoggingIn: boolean;

    checkAuth: () => Promise<User | null>;
    signup: (formData: Record<string, string>) => Promise<boolean | string>;
    login: (formData: Record<string, string>) => Promise<boolean | string>;
    logout: () => Promise<void>;
    updateSetting: (key: keyof User, setting: User[keyof User]) => Promise<User | null>;
    addSetting: (key: keyof User, setting: User[keyof User]) => Promise<User | null>;
    removeSetting: (key: keyof User, setting: User[keyof User]) => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,

    checkAuth: async () => {
        set({ isCheckingAuth: true });

        if (get().authUser) {
            set({ isCheckingAuth: false });
            return get().authUser;
        }

        try {
            const { data: session } = await authClient.getSession();

            if (!session?.user) {
                set({ authUser: null });
                return null;
            }

            const data = await userApi.getProfile();
            const user = data.data;

            if (!user) {
                throw new Error('Failed to fetch user data');
            }

            set({ authUser: user });
            return user;
        } catch (error) {
            console.error('Auth check failed:', error);
            set({ authUser: null });
            return null;
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (formData: Record<string, string>) => {
        set({ isSigningUp: true });
        try {
            const { error } = await authClient.signUp.email({
                email: formData.email,
                password: formData.password,
                name: formData.username, // Better Auth uses 'name' field
                username: formData.username, // Custom field passed to adapter
            } as Parameters<typeof authClient.signUp.email>[0] & { username: string });

            if (error) {
                throw new Error(error.message || 'Sign up failed');
            }

            // Fetch full user data after signup
            const profileRes = await userApi.getProfile();
            const user = profileRes.data;

            set({ authUser: user });
            return true;
        } catch (error) {
            console.error('Signup error:', error);
            if (error instanceof Error) {
                return error.message;
            }
            return 'Error signing up';
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (formData: Record<string, string>) => {
        set({ isLoggingIn: true });
        try {
            const { error } = await authClient.signIn.email({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                throw new Error(error.message || 'Invalid credentials');
            }

            // Fetch full user data after login
            const profileRes = await userApi.getProfile();
            const user = profileRes.data;

            set({ authUser: user });
            return true;
        } catch (error) {
            console.error('Login error:', error);
            if (error instanceof Error) {
                return error.message;
            }
            return 'Error logging in';
        } finally {
            set({ isLoggingIn: false });
        }
    },

    logout: async () => {
        try {
            await authClient.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
        set({ authUser: null });
    },

    updateSetting: async (key, setting) => {
        try {
            const data = await userApi.updateSetting(key, setting);

            if (!data) throw new Error('Error updating setting');

            const updatedSetting = data.data;
            const user = get().authUser;

            if (!user) throw new Error('No user logged in');

            const newUser = { ...user, [key]: updatedSetting };
            set({ authUser: newUser });
            return newUser;
        } catch (error) {
            console.error('Error updating setting:', error);
            return null;
        }
    },

    addSetting: async (key, setting) => {
        try {
            const data = await userApi.addSetting(key, setting);

            if (!data) throw new Error('Error adding setting');

            const updatedSetting = data.data;
            const user = get().authUser;

            if (!user) throw new Error('No user logged in');

            const newUser = { ...user, [key]: updatedSetting };
            set({ authUser: newUser });
            return newUser;
        } catch (error) {
            console.error('Error adding setting:', error);
            return null;
        }
    },

    removeSetting: async (key, setting) => {
        try {
            const data = await userApi.removeSetting(key, setting);

            if (!data) throw new Error('Error removing setting');

            const updatedSetting = data.data;
            const user = get().authUser;

            if (!user) throw new Error('No user logged in');

            const newUser = { ...user, [key]: updatedSetting };
            set({ authUser: newUser });
            return newUser;
        } catch (error) {
            console.error('Error removing setting:', error);
            return null;
        }
    },
}));
