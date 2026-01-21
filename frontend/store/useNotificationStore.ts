import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: number;
    read: boolean;
    actionUrl?: string;
}

interface NotificationStore {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    deleteNotification: (id: string) => void;
    clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set) => ({
            notifications: [],

            addNotification: (notification) => {
                const newNotification: Notification = {
                    ...notification,
                    id: Math.random().toString(36).substring(2, 9),
                    timestamp: Date.now(),
                    read: false,
                };

                set((state) => ({
                    notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
                }));
            },

            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map((n) =>
                        n.id === id ? { ...n, read: true } : n,
                    ),
                }));
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map((n) => ({ ...n, read: true })),
                }));
            },

            deleteNotification: (id) => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id),
                }));
            },

            clearAll: () => {
                set({ notifications: [] });
            },
        }),
        {
            name: 'money-tracker-notifications',
        },
    ),
);
