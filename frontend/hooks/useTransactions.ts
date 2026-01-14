import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export const useTransactions = (filters: any) => {
    return useQuery({
        queryKey: ['transactions', filters],
        queryFn: async () => {
            const res = await axiosInstance.get('/transaction/', { params: filters });
            const transactions = res.data.data;

            // Sort by date descending (newest first)
            return transactions.sort(
                (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
