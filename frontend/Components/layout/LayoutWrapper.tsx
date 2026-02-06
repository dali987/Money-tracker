'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import NavBar from './NavBar';
import { Toaster } from 'sonner';
import { KeyboardShortcutsProvider } from '../providers/KeyboardShortcutsProvider';
import { useNotificationTriggers } from '@/hooks/useNotificationTriggers';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';
    const isAuthPage = pathname === '/login' || pathname === '/signup';

    if (isLandingPage || isAuthPage) {
        return (
            <>
                <Toaster richColors />
                {children}
            </>
        );
    }

    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
    useNotificationTriggers();

    return (
        <KeyboardShortcutsProvider>
            <Header />
            <Toaster richColors />
            <NavBar>{children}</NavBar>
        </KeyboardShortcutsProvider>
    );
};
