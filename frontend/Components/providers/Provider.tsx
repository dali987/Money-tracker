'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ViewTransitions } from 'next-view-transitions';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];

const Provider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());

    const checkAuth = useAuthStore((state) => state.checkAuth);
    const isCheckingAuth = useAuthStore((state) => state.isCheckingAuth);
    const authUser = useAuthStore((state) => state.authUser);
    const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!hasCheckedAuth) {
            checkAuth();
        }
    }, [checkAuth, hasCheckedAuth]);

    useEffect(() => {
        if (isCheckingAuth || !hasCheckedAuth) return;

        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

        if (!authUser && !isPublicRoute) {
            router.replace('/login');
        }

        if (authUser && (pathname === '/login' || pathname === '/signup')) {
            router.replace('/dashboard');
        }
    }, [isCheckingAuth, hasCheckedAuth, authUser, router, pathname]);

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    if (!isPublicRoute && (!hasCheckedAuth || isCheckingAuth || !authUser)) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-base-100">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <NextThemesProvider attribute="data-theme" defaultTheme="darkmode" enableSystem={false}>
            <QueryClientProvider client={queryClient}>
                <ViewTransitions>{children}</ViewTransitions>
            </QueryClientProvider>
        </NextThemesProvider>
    );
};

export default Provider;
