'use client';

import { useEffect } from 'react';
import { useAccounts } from './useAccounts';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Account, Budget, Transaction } from '@/types';

export const useNotificationTriggers = () => {
    const { data: accounts } = useAccounts();
    const { budgets } = useBudgetStore();
    const { transactions } = useTransactionStore();
    const { addNotification, notificationCache, setNotificationCache, clearNotificationCache } =
        useNotificationStore();

    useEffect(() => {
        if (!accounts) return;

        accounts.forEach((account: Account) => {
            const cacheKey = `low-balance-${account._id}`;
            const roundedBalance = Number(account.balance.toFixed(2));
            const lastNotifiedBalance = notificationCache[cacheKey];

            // Notify only when the negative balance changes
            if (account.balance < 0 && lastNotifiedBalance !== roundedBalance) {
                addNotification({
                    title: 'Negative Balance Alert',
                    message: `Your account "${account.name}" has a negative balance of ${account.balance.toFixed(2)}.`,
                    type: 'error',
                    actionUrl: '/accounts',
                });
                setNotificationCache(cacheKey, roundedBalance);
            }

            // Reset cache when balance is no longer negative
            if (account.balance >= 0 && lastNotifiedBalance !== undefined) {
                clearNotificationCache(cacheKey);
            }
        });
    }, [
        accounts,
        addNotification,
        notificationCache,
        setNotificationCache,
        clearNotificationCache,
    ]);

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

            if (percentage >= 100 && !notificationCache[notificationId100]) {
                addNotification({
                    title: 'Budget Exceeded',
                    message: `You've spent ${spent.toFixed(2)} on "${budget.tag}", surpassing your ${budget.amount} budget.`,
                    type: 'error',
                    actionUrl: '/budget',
                });
                setNotificationCache(notificationId100, true);
                setNotificationCache(notificationId80, true); // Mark 80 as done too if we hit 100
            } else if (percentage >= threshold && !notificationCache[notificationId80]) {
                addNotification({
                    title: 'Budget Warning',
                    message: `You've reached ${Math.round(percentage)}% of your monthly budget for "${budget.tag}".`,
                    type: 'warning',
                    actionUrl: '/budget',
                });
                setNotificationCache(notificationId80, true);
            }
        });
    }, [
        budgets,
        transactions,
        addNotification,
        notificationCache,
        setNotificationCache,
    ]);
};
