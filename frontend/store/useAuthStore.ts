import { create } from 'zustand';
import { axiosInstance } from '@/lib/axios';
import { authClient } from '@/lib/auth-client';

// Define types for our User and State
// We extend the Better Auth user with our custom fields
export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
    // Custom fields
    username?: string;
    currencies?: string[];
    baseCurrency?: string;
    groups?: string[];
    tags?: string[];
    profilePic?: string;
    [key: string]: any; // Allow for flexible expansion
}

interface AuthState {
    authUser: User | null;
    isCheckingAuth: boolean;
    isSigningUp: boolean;
    isLoggingIn: boolean;

    checkAuth: () => Promise<User | null>;
    signup: (formData: any) => Promise<boolean | string>;
    login: (formData: any) => Promise<boolean | string>;
    logout: () => Promise<void>;
    updateSetting: (key: string, setting: any) => Promise<any>;
    addSetting: (key: string, setting: any) => Promise<any>;
    removeSetting: (key: string, setting: any) => Promise<any>;
}

/**
 * Auth store for managing authentication state and user settings.
 *
 * Authentication is handled by Better Auth client, but this store
 * provides a centralized place for user data and settings management.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
    authUser: null,
    isCheckingAuth: true,
    isSigningUp: false,
    isLoggingIn: false,

    /**
     * Check if user is authenticated by fetching session from Better Auth.
     * Also fetches full user data from the API for application-specific fields.
     */
    checkAuth: async () => {
        set({ isCheckingAuth: true });

        // If we already have user data, return it
        if (get().authUser) {
            set({ isCheckingAuth: false });
            return get().authUser;
        }

        try {
            // Get session from Better Auth
            const { data: session } = await authClient.getSession();

            if (!session?.user) {
                // No session found, user is not logged in
                // Don't throw error here, just return null as it's a valid state
                set({ authUser: null });
                return null;
            }

            // Fetch full user data from our API (includes custom fields)
            // Ideally better-auth session would have everything, but we might have large arrays/settings
            const res = await axiosInstance.get('/user/');
            const user = res.data.data;

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

    /**
     * Sign up a new user using Better Auth.
     * @param formData - Object containing username, email, and password
     * @returns true on success, error message string on failure
     */
    signup: async (formData) => {
        set({ isSigningUp: true });
        try {
            // Use Better Auth to create the account
            const { data, error } = await authClient.signUp.email({
                email: formData.email,
                password: formData.password,
                name: formData.username, // Better Auth uses 'name' field
                username: formData.username, // Custom field passed to adapter
            } as any);

            if (error) {
                throw new Error(error.message || 'Sign up failed');
            }

            // Fetch full user data after signup
            const res = await axiosInstance.get('/user/');
            const user = res.data.data;

            set({ authUser: user });
            return true;
        } catch (error: any) {
            console.error('Signup error:', error);
            return error.message || 'Error signing up';
        } finally {
            set({ isSigningUp: false });
        }
    },

    /**
     * Log in an existing user using Better Auth.
     * @param formData - Object containing email and password
     * @returns true on success, error message string on failure
     */
    login: async (formData) => {
        set({ isLoggingIn: true });
        try {
            // Use Better Auth to sign in
            const { data, error } = await authClient.signIn.email({
                email: formData.email,
                password: formData.password,
            });

            if (error) {
                throw new Error(error.message || 'Invalid credentials');
            }

            // Fetch full user data after login
            const res = await axiosInstance.get('/user/');
            const user = res.data.data;

            set({ authUser: user });
            return true;
        } catch (error: any) {
            console.error('Login error:', error);
            return error.message || 'Error logging in';
        } finally {
            set({ isLoggingIn: false });
        }
    },

    /**
     * Log out the current user.
     */
    logout: async () => {
        try {
            await authClient.signOut();
        } catch (error) {
            console.error('Logout error:', error);
        }
        set({ authUser: null });
    },

    /**
     * Update a user setting.
     * @param key - Setting key to update
     * @param setting - New value for the setting
     */
    updateSetting: async (key, setting) => {
        try {
            const res = await axiosInstance.post('/user/update', { key, setting });

            if (!res) throw new Error('Error updating setting');

            const updatedSetting = res.data.data;
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

    /**
     * Add a value to an array setting (e.g., add a tag).
     * @param key - Setting key (array field)
     * @param setting - Value to add to the array
     */
    addSetting: async (key, setting) => {
        try {
            const res = await axiosInstance.post('/user/add', { key, setting });

            if (!res) throw new Error('Error adding setting');

            const updatedSetting = res.data.data;
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

    /**
     * Remove a value from an array setting (e.g., remove a tag).
     * @param key - Setting key (array field)
     * @param setting - Value to remove from the array
     */
    removeSetting: async (key, setting) => {
        try {
            const res = await axiosInstance.post('/user/remove', { key, setting });

            if (!res) throw new Error('Error removing setting');

            const updatedSetting = res.data.data;
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
