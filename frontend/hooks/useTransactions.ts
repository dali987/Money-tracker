import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Transaction, TransactionFilter } from '@/types';

export const useTransactions = (filters: TransactionFilter = {}) => {
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
    });
};
