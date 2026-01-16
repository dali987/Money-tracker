'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { ViewTransitions } from 'next-view-transitions';

/**
 * Routes that don't require authentication.
 * Users can access these pages without being logged in.
 */
const PUBLIC_ROUTES = ['/', '/login', '/signup'];

const Provider = ({ children }: { children: React.ReactNode }) => {
    const [queryClient] = useState(() => new QueryClient());
    const { checkAuth, isCheckingAuth, authUser } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    useEffect(() => {
        // Don't redirect if still checking auth
        if (isCheckingAuth) return;

        // Check if current path is a public route
        const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);

        // If user is not authenticated and trying to access a protected route
        if (authUser === null && !isPublicRoute) {
            router.push('/login');
        }

        // If user IS authenticated and on login/signup page, redirect to dashboard
        if (authUser !== null && (pathname === '/login' || pathname === '/signup')) {
            router.push('/dashboard');
        }
    }, [isCheckingAuth, authUser, router, pathname]);

    if (isCheckingAuth) {
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
