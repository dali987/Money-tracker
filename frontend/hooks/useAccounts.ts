import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Account } from '@/types';
import { useAuthStore } from '@/store/useAuthStore';

export const useAccounts = () => {
    const authUser = useAuthStore((state) => state.authUser);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);

    return useQuery<Account[]>({
        queryKey: ['accounts'],
        queryFn: async () => {
            const res = await axiosInstance.get('/account/');
            return res.data.data;
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!authUser && !isCheckingAuth,
    });
};
