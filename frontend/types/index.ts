export type TransactionType = 'expense' | 'income' | 'transfer';

export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
    username?: string;
    currencies?: string[];
    baseCurrency?: string;
    groups?: string[];
    tags?: string[];
    profilePic?: string;
}

export interface Account {
    _id: string;
    userId: string;
    name: string;
    balance: number;
    currency: string;
    group: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Transaction {
    _id: string;
    userId: string;
    accountId: string;
    fromAccount?: string; // Legacy field used in UI for transfers
    toAccount?: string; // Legacy field used in UI for transfers
    toAccountId?: string; // Standard field for transfers
    type: TransactionType;
    amount: number;
    description: string;
    note?: string; // Field used in UI instead of description
    date: string | Date;
    tags: string[];
    category?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Budget {
    _id: string;
    userId: string;
    tag: string;
    amount: number;
    period: string;
    alertThreshold: number;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: number;
    read: boolean;
    actionUrl?: string;
}

export interface MultiCurrencySummary {
    totalNetWorth: number;
    sumsByGroup: Record<string, number>;
    sumsByAccount: Record<string, number>;
}

export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
}

export type Rates = Record<string, number>;

export interface CurrencyOption {
    label: string;
    value: string;
}
export interface RecurringTransaction {
    _id: string;
    user: string;
    type: TransactionType;
    fromAccount?: any;
    toAccount?: any;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    nextRunDate: string;
    active: boolean;
    description: string;
    tags: string[];
    lastRunDate?: string;
}
