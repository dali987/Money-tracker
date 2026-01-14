'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import NavBar from './NavBar';
import { Toaster } from 'sonner';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLandingPage = pathname === '/';

    if (isLandingPage) {
        return (
            <>
                <Toaster richColors />
                {children}
            </>
        );
    }

    return (
        <>
            <Header />
            <Toaster richColors />
            <NavBar>{children}</NavBar>
        </>
    );
}
