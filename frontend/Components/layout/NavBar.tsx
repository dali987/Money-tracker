'use client';

import { usePathname } from 'next/navigation';
import {
    ArrowRightLeft,
    Newspaper,
    CreditCard,
    ChartSpline,
    ShoppingBasket,
    SlidersHorizontal,
    LucideIcon,
    Repeat,
} from 'lucide-react';
import Link from 'next/link';

const elements = [
    {
        name: 'Dashboard',
        icon: Newspaper,
    },
    {
        name: 'Transactions',
        icon: ArrowRightLeft,
    },
    {
        name: 'Recurring',
        icon: Repeat,
    },
    {
        name: 'Accounts',
        icon: CreditCard,
    },
    {
        name: 'Reports',
        icon: ChartSpline,
    },
    {
        name: 'Budget',
        icon: ShoppingBasket,
    },
    {
        name: 'Settings',
        icon: SlidersHorizontal,
    },
];

const NavElement = ({
    name,
    icon,
    active = false,
}: {
    name: string;
    icon: LucideIcon;
    active?: boolean;
}) => {
    const IconComponent = icon;
    return (
        <li>
            <Link
                href={`/${name.toLowerCase()}`}
                className={`is-drawer-close:tooltip is-drawer-close:tooltip-right gap-4 ${
                    active ? 'bg-neutral text-neutral-content' : ''
                }`}
                data-tip={name}>
                <IconComponent className="inline-block size-8 my-1.5" />
                <span className="is-drawer-close:hidden">{name}</span>
            </Link>
        </li>
    );
};

const NavBar = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    return (
        <nav className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content bg-base-200">{children}</div>

            <div className="drawer-side z-999 lg:z-auto is-drawer-close:overflow-visible h-[calc(100vh-var(--header-height))] mt-(--header-height) lg:mt-0">
                <label
                    htmlFor="my-drawer-4"
                    aria-label="close sidebar"
                    className="drawer-overlay"></label>
                <div className="w-64 lg:is-drawer-close:w-18 lg:is-drawer-open:w-64 shadow-neutral shadow-xl flex flex-col items-start lg:fixed h-full lg:h-[calc(100vh-var(--header-height))]">
                    <ul className="menu w-full grow gap-2">
                        {elements.map((element) => (
                            <NavElement
                                key={element.name}
                                active={pathname?.includes(element.name.toLowerCase())}
                                {...element}
                            />
                        ))}
                    </ul>

                    <div
                        className="hidden lg:block m-4 is-drawer-close:tooltip is-drawer-close:tooltip-right"
                        data-tip="Open">
                        <label
                            htmlFor="my-drawer-4"
                            className="btn btn-ghost btn-circle drawer-button is-drawer-open:rotate-y-180">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                strokeWidth="2"
                                fill="none"
                                stroke="currentColor"
                                className="inline-block size-6 my-1.5">
                                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                                <path d="M9 4v16"></path>
                                <path d="M14 10l2 2l-2 2"></path>
                            </svg>
                        </label>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
