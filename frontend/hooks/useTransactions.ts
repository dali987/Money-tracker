import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

export const useTransactions = (filters: any) => {
    return useQuery({
        queryKey: ['transactions', filters],
        queryFn: async () => {
            const res = await axiosInstance.get('/transaction/', { params: filters });
            return res.data.data;
        },
    });
};
