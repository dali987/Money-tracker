import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Transaction, TransactionFilter, PaginatedResponse } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';

export const useTransactions = (filters?: TransactionFilter) => {
    const authUser = useAuthStore((state) => state.authUser);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
    const filtersKey = filters
        ? JSON.stringify(filters, Object.keys(filters).sort())
        : 'all';

    return useQuery<Transaction[]>({
        queryKey: ['transactions', filtersKey],
        queryFn: async () => {
            const res = await axiosInstance.get('/transaction/', { params: filters });
            const transactions = res.data.data as Transaction[];

            return [...transactions].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!authUser && !isCheckingAuth && filters !== undefined,
    });
};

export const usePaginatedTransactions = (
    page: number,
    limit: number = 10,
    filters?: Omit<TransactionFilter, 'page' | 'limit'>,
) => {
    const authUser = useAuthStore((state) => state.authUser);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
    const filtersKey = filters
        ? JSON.stringify(filters, Object.keys(filters).sort())
        : 'all';

    return useQuery<PaginatedResponse<Transaction>>({
        queryKey: ['transactions', 'paginated', page, limit, filtersKey],
        queryFn: async () => {
            const res = await axiosInstance.get('/transaction/', {
                params: { ...filters, page, limit },
            });
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
        placeholderData: (previousData) => previousData,
        enabled: !!authUser && !isCheckingAuth,
    });
};
