import Link from 'next/link';
import React from 'react';

const Footer = () => {
    return (
        <footer
            className="py-16 px-4 lg:px-12 border-t border-white/10"
            style={{ background: '#000000' }}>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h3 className="text-2xl font-black mb-2 text-white">Money Tracker</h3>
                        <p className="text-gray-400">Your personal finance management solution</p>
                    </div>
                    <div className="flex gap-8 flex-wrap justify-center">
                        {['Dashboard', 'Transactions', 'Reports', 'Accounts', 'Budget'].map(
                            (link) => (
                                <Link
                                    key={link}
                                    href={`/${link.toLowerCase()}`}
                                    className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                                    {link}
                                </Link>
                            )
                        )}
                    </div>
                </div>
                <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Money Tracker. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
