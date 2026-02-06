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
    notificationCache: Record<string, number | boolean>;
    setNotificationCache: (key: string, value: number | boolean) => void;
    clearNotificationCache: (key: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set) => ({
            notifications: [],
            notificationCache: {},

            addNotification: (notification) => {
                const newNotification: Notification = {
                    ...notification,
                    id: crypto.randomUUID(),
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

            setNotificationCache: (key, value) => {
                set((state) => ({
                    notificationCache: {
                        ...state.notificationCache,
                        [key]: value,
                    },
                }));
            },

            clearNotificationCache: (key) => {
                set((state) => {
                    if (!(key in state.notificationCache)) return state;
                    const nextCache = { ...state.notificationCache };
                    delete nextCache[key];
                    return { notificationCache: nextCache };
                });
            },
        }),
        {
            name: 'money-tracker-notifications',
        },
    ),
);
