'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { ThemeToggle } from '@/Components/ThemeToggle';

const Header = () => {
    const pathname = usePathname();
    const title = pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2);

    return (
        <header className="sticky z-99999 top-0 left-0 w-full bg-base-300 backdrop-blur-md border-b border-base-200 flex justify-between items-center px-4 lg:px-12 py-4 z-50 shadow-sm h-(--header-height)">
            <div className="flex items-center gap-4 lg:gap-16">
                {/* Hamburger menu for mobile */}
                <label
                    htmlFor="my-drawer-4"
                    className="btn btn-ghost btn-circle lg:hidden text-base-content hover:bg-base-200 border-0 hover:shadow-lg active:bg-base-300">
                    <Menu size={24} />
                </label>
                <div className="flex items-center gap-2">
                    <Image src="/logo.svg" className='' alt="logo" width={40} height={40} />
                    <h1 className="text-xl lg:text-3xl font-bold text-base-content tracking-tight">
                        Money Tracker
                    </h1>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <h1 className="text-lg lg:text-xl font-medium hidden md:block">{title}</h1>
                <ThemeToggle />
            </div>
        </header>
    );
};

export default Header;
