import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { useTransactionStore } from '@/store/useTransactionStore';

export const useAccounts = () => {
    const accounts = useTransactionStore.getState().accounts;
    if (!accounts || accounts.length < 1) {
        return useQuery({
            queryKey: ['accounts'],
            queryFn: async () => {
                const res = await axiosInstance.get('/account/');
                return res.data.data;
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
        });
    }
    else return accounts;
};
