import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export const useAccounts = () => {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const res = await axiosInstance.get('/account/');
            return res.data.data;
        },
    });
};
