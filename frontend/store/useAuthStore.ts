import { create } from 'zustand';
import { authClient } from '@/lib/auth-client';

import { User } from '@/types';
import { userApi } from '@/lib/api/user';

interface AuthState {
    authUser: User | null;
    isCheckingAuth: boolean;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    hasCheckedAuth: boolean;

    checkAuth: (force?: boolean) => Promise<User | null>;
    signup: (formData: Record<string, string>) => Promise<boolean | string>;
    login: (formData: Record<string, string>) => Promise<boolean | string>;
    logout: () => Promise<void>;
    updateSetting: (key: keyof User, setting: User[keyof User]) => Promise<User | null>;
    addSetting: (key: keyof User, setting: User[keyof User]) => Promise<User | null>;
    removeSetting: (key: keyof User, setting: User[keyof User]) => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    authUser: null,
    isCheckingAuth: false,
    isSigningUp: false,
    isLoggingIn: false,
    hasCheckedAuth: false,

    checkAuth: async (force = false) => {
        const { authUser, hasCheckedAuth, isCheckingAuth } = get();

        if (isCheckingAuth) return authUser;
        if (hasCheckedAuth && !force) return authUser;

        set({ isCheckingAuth: true });

        if (authUser && !force) {
            set({ isCheckingAuth: false, hasCheckedAuth: true });
            return authUser;
        }

        try {
            const { data: session } = await authClient.getSession();

            if (!session?.user) {
                set({ authUser: null, hasCheckedAuth: true });
                return null;
            }

            const data = await userApi.getProfile();
            const user = data.data;

            if (!user) {
                throw new Error('Failed to fetch user data');
            }

            set({ authUser: user, hasCheckedAuth: true });
            return user;
        } catch (error) {
            console.error('Auth check failed:', error);
            // If getProfile fails but we had a session, we need to clear the session in authClient
            // prevents inconsistent state where client thinks user is logged in
            await authClient.signOut();
            set({ authUser: null, hasCheckedAuth: true });
            return null;
        } finally {
            set({ isCheckingAuth: false, hasCheckedAuth: true });
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

            set({ authUser: user, hasCheckedAuth: true });
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

            set({ authUser: user, hasCheckedAuth: true });
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
        set({ authUser: null, hasCheckedAuth: true });
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
