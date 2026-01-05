'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

const Header = () => {
    const pathname = usePathname();
    const title = pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2);

    return (
        <header className="sticky top-0 left-0 w-full bg-[#3f51b5] flex justify-between items-center px-4 lg:px-12 py-4 z-999999 shadow-xl h-(--header-height)">
            <div className="flex items-center gap-4 lg:gap-16">
                {/* Hamburger menu for mobile */}
                <label
                    htmlFor="my-drawer-4"
                    className="btn btn-ghost btn-circle lg:hidden text-white hover:bg-gray-500/50 border-0 hover:shadow-lg active:bg-neutral/70">
                    <Menu size={24} />
                </label>
                <Image src="/logo.svg" alt= "logo" width={40} height={40} />
                <h1 className="text-xl lg:text-3xl text-neutral-50">Money Tracker</h1>
            </div>
            <div>
                <h1 className="text-lg lg:text-2xl text-neutral-50">{title}</h1>
            </div>
        </header>
    );
};

export default Header;
