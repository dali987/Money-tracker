import Link from 'next/link';

const Footer = () => {
    return (
        <footer className="relative pt-24 pb-12 px-4 lg:px-12 border-t border-white/5 bg-black/50 backdrop-blur-md overflow-hidden z-20">
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-indigo-950/20 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 mb-24 text-center md:text-left">
                    <div className="col-span-1 md:col-span-2">
                        <Link
                            href="/"
                            className="inline-block text-2xl font-black text-white mb-6 uppercase tracking-wider">
                            Money Tracker
                        </Link>
                        <p className="text-gray-400 max-w-md text-lg leading-relaxed">
                            The advanced financial command center for modern individuals. Take
                            control of your wealth with precision tools and intuitive analytics.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6 text-lg">Platform</h4>
                        <ul className="space-y-4">
                            {['Dashboard', 'Transactions', 'Recurring', 'Accounts', 'Reports', 'Budget'].map((link) => (
                                <li key={link}>
                                    <Link
                                        href={`/${link.toLowerCase()}`}
                                        className="text-gray-500 hover:text-indigo-400 transition-colors duration-300 block">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="w-full border-t border-white/10 pt-12 flex flex-col items-center">
                    <h1 className="text-[12vw] leading-[0.8] font-black text-transparent bg-clip-text bg-linear-to-b from-white/10 to-transparent select-none pointer-events-none tracking-tighter mix-blend-overlay">
                        TRACKER
                    </h1>
                    <div className="flex justify-between w-full text-xs md:text-sm text-gray-600 font-mono mt-8 uppercase tracking-widest">
                        <p>&copy; {new Date().getFullYear()} Money Tracker Inc.</p>
                        <p>Designed for Excellence</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
