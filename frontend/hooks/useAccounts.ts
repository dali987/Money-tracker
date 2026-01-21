import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Account } from '@/types';

export const useAccounts = () => {
    // Always return useQuery to strictly follow React Rules of Hooks
    return useQuery<Account[]>({
        queryKey: ['accounts'],
        queryFn: async () => {
            const res = await axiosInstance.get('/account/');
            return res.data.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
