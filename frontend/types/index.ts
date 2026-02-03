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
    type: TransactionType;
    fromAccount?: string | Account;
    toAccount?: string | Account;
    amount: number;
    note?: string;
    date: string | Date;
    tags: string[];
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

export interface AccountSummary {
    totalNetWorth: number;
    sumsByGroup: Record<string, number>;
}

export interface MultiCurrencySummary extends AccountSummary {
    sumsByAccount: Record<string, number>;
}

export interface TransactionSummary {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
}

export type Rates = Record<string, number>;

export interface CurrencyOption {
    code: string;
    currency: string;
    currency_code: string;
    currency_symbol: string;
    dial_code: string;
    flag: string;
    local_name: string;
    name: string;
    preferred: boolean;
}

export interface RecurringTransaction {
    _id: string;
    user: string;
    type: TransactionType;
    fromAccount?: string | Account;
    toAccount?: string | Account;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    nextRunDate: string;
    note?: string;
    active: boolean;
    description: string;
    tags: string[];
    lastRunDate?: string;
}

export interface TransactionFilter {
    type?: string;
    startDate?: Date;
    endDate?: Date;
    tags?: string;
    groupBy?: string;
    account?: string;
    excludeTags?: string;
    page?: number;
    limit?: number;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: PaginationMeta;
}

export type ChartDataResponse = {
    _id: number;
    income: number;
    expense: number;
};

export type ChartData = Omit<ChartDataResponse, '_id'> & { period: number };

export type ReportChartData = {
    period: string;
    income?: number;
    expense?: number;
    worth?: number;
    [key: string]: string | number | undefined;
};

export type NetWorthChartResponse = {
    netWorthAtEndOfPeriod: number;
    changes: Record<string, number>;
};
