import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import LayoutWrapper from '../Components/layout/LayoutWrapper';
import Provider from '@/Components/providers/Provider';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Money Tracker - Take Control of Your Finances',
    description:
        'The ultimate money tracking solution to manage accounts, track transactions, analyze spending, and achieve your financial goals.',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}>
                <Provider>
                    <LayoutWrapper>{children}</LayoutWrapper>
                </Provider>
            </body>
        </html>
    );
}
