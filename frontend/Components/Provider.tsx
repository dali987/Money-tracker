'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ViewTransitions } from 'next-view-transitions';

const Provider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());
    const { checkAuth, isCheckingAuth, authUser } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        if (!isCheckingAuth && authUser === null) {
            router.push('/'); // send to homepage
        }
    }, [isCheckingAuth, authUser, router]);

    return (
        <QueryClientProvider client={queryClient}>
            <ViewTransitions>{children}</ViewTransitions>
        </QueryClientProvider>
    );
};

export default Provider;
