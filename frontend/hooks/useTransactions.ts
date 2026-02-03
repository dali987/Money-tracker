import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Transaction, TransactionFilter, PaginatedResponse } from '@/types';

/**
 * Hook for fetching all transactions (no pagination)
 * Used for components that need full data set (e.g., reports, charts)
 */
export const useTransactions = (filters?: TransactionFilter) => {
    return useQuery<Transaction[]>({
        queryKey: ['transactions', filters],
        queryFn: async () => {
            const res = await axiosInstance.get('/transaction/', { params: filters });
            const transactions = res.data.data as Transaction[];

            // Sort by date descending (newest first)
            return [...transactions].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: filters !== undefined,
    });
};

/**
 * Hook for fetching paginated transactions
 * Delegates pagination to the server for better performance
 */
export const usePaginatedTransactions = (
    page: number,
    limit: number = 10,
    filters?: Omit<TransactionFilter, 'page' | 'limit'>,
) => {
    return useQuery<PaginatedResponse<Transaction>>({
        queryKey: ['transactions', 'paginated', page, limit, filters],
        queryFn: async () => {
            const res = await axiosInstance.get('/transaction/', {
                params: { ...filters, page, limit },
            });
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        placeholderData: (previousData) => previousData, // Keep previous data while loading
    });
};
