'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
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
        <NextThemesProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem={false}>
            <QueryClientProvider client={queryClient}>
                <ViewTransitions>{children}</ViewTransitions>
            </QueryClientProvider>
        </NextThemesProvider>
    );
};

export default Provider;
