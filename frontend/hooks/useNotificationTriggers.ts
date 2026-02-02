'use client';

import { useEffect, useRef } from 'react';
import { useAccounts } from './useAccounts';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Account, Budget, Transaction } from '@/types';

export const useNotificationTriggers = () => {
    const { data: accounts } = useAccounts();
    const { budgets } = useBudgetStore();
    const { transactions } = useTransactionStore();
    const { addNotification, notifications } = useNotificationStore();

    // Use refs to prevent duplicate notifications in the same session
    const notifiedIds = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!accounts) return;

        accounts.forEach((account: Account) => {
            const notificationId = `low-balance-${account._id}-${Math.floor(account.balance)}`;

            // Notify if balance is negative and we haven't notified about this specific negative state yet
            if (account.balance < 0 && !notifiedIds.current.has(notificationId)) {
                // Check if we already have a similar unread notification to avoid spam
                const alreadyNotified = notifications.some(
                    (n) =>
                        n.title.includes(account.name) && !n.read && n.message.includes('negative'),
                );

                if (!alreadyNotified) {
                    addNotification({
                        title: 'Negative Balance Alert',
                        message: `Your account "${account.name}" has a negative balance of ${account.balance.toFixed(2)}.`,
                        type: 'error',
                        actionUrl: '/accounts',
                    });
                    notifiedIds.current.add(notificationId);
                }
            }
        });
    }, [accounts, addNotification, notifications]);

    useEffect(() => {
        if (!budgets || budgets.length === 0 || !transactions || transactions.length === 0) return;

        budgets.forEach((budget: Budget) => {
            const spent = transactions
                .filter((t: Transaction) => t.type === 'expense' && t.tags?.includes(budget.tag))
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            const percentage = (spent / budget.amount) * 100;
            const threshold = budget.alertThreshold || 80;

            const notificationId80 = `budget-80-${budget._id}-${new Date().getMonth()}`;
            const notificationId100 = `budget-100-${budget._id}-${new Date().getMonth()}`;

            if (percentage >= 100 && !notifiedIds.current.has(notificationId100)) {
                addNotification({
                    title: 'Budget Exceeded',
                    message: `You've spent ${spent.toFixed(2)} on "${budget.tag}", surpassing your ${budget.amount} budget.`,
                    type: 'error',
                    actionUrl: '/budget',
                });
                notifiedIds.current.add(notificationId100);
                notifiedIds.current.add(notificationId80); // Mark 80 as done too if we hit 100
            } else if (percentage >= threshold && !notifiedIds.current.has(notificationId80)) {
                addNotification({
                    title: 'Budget Warning',
                    message: `You've reached ${Math.round(percentage)}% of your monthly budget for "${budget.tag}".`,
                    type: 'warning',
                    actionUrl: '/budget',
                });
                notifiedIds.current.add(notificationId80);
            }
        });
    }, [budgets, transactions, addNotification, notifications]);
};
