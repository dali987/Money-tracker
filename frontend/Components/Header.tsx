'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, LogOut, Settings, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/Components/ThemeToggle';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { toast } from 'sonner';
import { useShortcutsHelp } from './KeyboardShortcutsProvider';
import { useQueryClient } from '@tanstack/react-query';
import { NotificationCenter } from './NotificationCenter';

const Header = () => {
    const pathname = usePathname();
    const router = useRouter();
    const authUser = useAuthStore((state) => state.authUser);
    const logout = useAuthStore((state) => state.logout);
    const queryClient = useQueryClient();

    const handleLogout = async () => {
        await logout();
        queryClient.removeQueries();
        toast.success('Logged out successfully');
        router.push('/login');
    };

    return (
        <header className="sticky z-99999 top-0 left-0 w-full bg-base-100 flex justify-between items-center px-4 lg:px-8 py-3 h-16 shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
                {/* Hamburger menu for mobile */}
                <label
                    htmlFor="my-drawer-4"
                    className="btn btn-ghost btn-circle btn-sm lg:hidden text-base-content/80 hover:bg-base-200">
                    <Menu size={20} />
                </label>

                <div
                    className="flex items-center gap-3 select-none"
                    onClick={() => router.push('/dashboard')}>
                    <div className="relative w-8 h-8 lg:w-9 lg:h-9">
                        <Image
                            src="/logo.svg"
                            alt="logo"
                            fill
                            className="object-contain pointer-events-none light:invert light:brightness-70"
                        />
                    </div>
                    <h1 className="text-xl font-black hidden sm:block text-base-content">
                        Money Tracker
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
                {/* Page Title - hidden on mobile, visible on desktop */}
                <h1 className="text-sm font-medium text-base-content/60 hidden md:block capitalize mr-4">
                    {pathname.split('/')[1] || 'Dashboard'}
                </h1>

                <button
                    onClick={useShortcutsHelp().showHelp}
                    className="btn btn-ghost btn-circle"
                    title="Keyboard Shortcuts (?)">
                    <Keyboard size={20} />
                </button>

                <ThemeToggle />
                <NotificationCenter />

                {authUser ? (
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost btn-circle avatar online ring-2 ring-base-content/10 hover:ring-base-content/30 transition-all p-0.5">
                            <div className="w-9 h-9 rounded-full overflow-hidden">
                                {authUser.image ? (
                                    <Image
                                        src={authUser.image}
                                        alt={authUser.name || 'User'}
                                        width={36}
                                        height={36}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-base-300 flex items-center justify-center text-base-content font-bold">
                                        {(
                                            authUser.name?.[0] ||
                                            authUser.email?.[0] ||
                                            'U'
                                        ).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="mt-3 z-1 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-base-200">
                            <li className="menu-title px-4 py-2 hover:bg-transparent">
                                <span className="text-xs font-normal text-base-content/60 active:bg-transparent!">
                                    Signed in as
                                </span>
                                <span className="font-bold text-base text-base-content block truncate max-w-44 select-text active:bg-transparent!">
                                    {authUser.username || authUser.name || 'User'}
                                </span>
                                <span className="font-normal text-xs text-base-content/50 truncate block max-w-44 select-text active:bg-transparent!">
                                    {authUser.email}
                                </span>
                            </li>
                            <div className="divider my-1 hover:bg-transparent"></div>
                            <li>
                                <Link href="/settings" className="flex items-center gap-2 py-2">
                                    <Settings size={16} />
                                    Settings
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 py-2 text-error hover:bg-error/10">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </div>
                ) : (
                    <Link href="/login" className="btn btn-primary btn-sm rounded-full px-6">
                        Login
                    </Link>
                )}
            </div>
        </header>
    );
};

export default Header;
