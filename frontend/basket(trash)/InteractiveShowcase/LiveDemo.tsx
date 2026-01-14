'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';
import { 
    Plus, 
    ArrowLeftRight, 
    TrendingUp, 
    Wallet,
    CreditCard,
    DollarSign,
    Calendar,
    Tag
} from 'lucide-react';
import { colors } from '@/app/Constants';

const LiveDemo = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const demoScreenRef = useRef<HTMLDivElement>(null);
    const [activeDemo, setActiveDemo] = useState('transaction');
    const [isAnimating, setIsAnimating] = useState(false);

    const demos = {
        transaction: {
            title: "Add Transaction",
            description: "Quickly add income, expenses, or transfers",
            icon: Plus,
            color: colors.primary,
        },
        transfer: {
            title: "Account Transfer",
            description: "Move money between accounts seamlessly",
            icon: ArrowLeftRight,
            color: colors.secondary,
        },
        analytics: {
            title: "View Analytics",
            description: "Visualize your financial data",
            icon: TrendingUp,
            color: colors.accent,
        },
    };

    const mockData = {
        accounts: [
            { name: "Cash Balance", balance: "$2,450.00", icon: Wallet, color: colors.success },
            { name: "Main Bank", balance: "$12,350.00", icon: CreditCard, color: colors.primary },
            { name: "Credit Card", balance: "-$1,200.00", icon: CreditCard, color: colors.error },
        ],
        transactions: [
            { description: "Grocery Store", amount: "-$85.50", category: "Food", date: "Today" },
            { description: "Salary Deposit", amount: "+$3,500.00", category: "Income", date: "Yesterday" },
            { description: "Electric Bill", amount: "-$120.00", category: "Utilities", date: "2 days ago" },
        ],
    };

    useGSAP(
        () => {
            if (!containerRef.current || !demoScreenRef.current) return;

            // Demo screen entrance animation
            gsap.fromTo(
                demoScreenRef.current,
                {
                    opacity: 0,
                    scale: 0.9,
                    rotateX: -10,
                },
                {
                    opacity: 1,
                    scale: 1,
                    rotateX: 0,
                    duration: 1,
                    ease: "power3.out",
                }
            );

            // Floating animation for demo screen
            gsap.to(demoScreenRef.current, {
                y: -10,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut",
            });
        },
        { scope: containerRef }
    );

    const handleDemoSwitch = (demoType: string) => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        
        // Animate out
        gsap.to(demoScreenRef.current, {
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                setActiveDemo(demoType);
                // Animate in
                gsap.to(demoScreenRef.current, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out",
                    onComplete: () => setIsAnimating(false),
                });
            },
        });
    };

    const renderDemoContent = () => {
        switch (activeDemo) {
            case 'transaction':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                <Plus className="w-6 h-6 text-indigo-500" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">New Transaction</h4>
                                <p className="text-gray-400 text-sm">Add income or expense</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Amount</label>
                                <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <DollarSign className="w-5 h-5 text-gray-400" />
                                    <span className="text-white text-lg">$250.00</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Description</label>
                                <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <Tag className="w-5 h-5 text-gray-400" />
                                    <span className="text-white">Coffee Shop</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Date</label>
                                <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                    <span className="text-white">Today</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
                
            case 'transfer':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                <ArrowLeftRight className="w-6 h-6 text-green-500" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">Transfer Money</h4>
                                <p className="text-gray-400 text-sm">Between accounts</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">From</label>
                                {mockData.accounts.slice(0, 2).map((account, index) => (
                                    <div key={index} className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <account.icon className="w-5 h-5" style={{ color: account.color }} />
                                            <span className="text-white">{account.name}</span>
                                        </div>
                                        <span className="text-gray-400">{account.balance}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Amount</label>
                                <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <DollarSign className="w-5 h-5 text-gray-400" />
                                    <span className="text-white text-lg">$500.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
                
            case 'analytics':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">Financial Overview</h4>
                                <p className="text-gray-400 text-sm">This month's insights</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-xl p-4 border border-indigo-500/30">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-300">Total Balance</span>
                                    <span className="text-2xl font-bold text-white">$13,600.00</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <span className="text-green-500 text-sm">+12.5% from last month</span>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {mockData.transactions.map((transaction, index) => (
                                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-medium">{transaction.description}</p>
                                            <p className="text-gray-500 text-sm">{transaction.category} • {transaction.date}</p>
                                        </div>
                                        <span className={`font-bold ${transaction.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                            {transaction.amount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div ref={containerRef} className="py-16 lg:py-24">
            {/* Section Header */}
            <div className="text-center mb-16 lg:mb-20">
                <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                    Live{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-400">
                        Demo
                    </span>
                </h3>
                <p className="text-lg lg:text-2xl text-gray-400 max-w-3xl mx-auto">
                    Experience the app's interface with interactive demonstrations
                </p>
            </div>

            {/* Demo Controls */}
            <div className="flex justify-center mb-12">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-2 flex gap-2">
                    {Object.entries(demos).map(([key, demo]) => {
                        const Icon = demo.icon;
                        const isActive = activeDemo === key;
                        
                        return (
                            <button
                                key={key}
                                onClick={() => handleDemoSwitch(key)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
                                    isActive 
                                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{demo.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Demo Screen */}
            <div className="flex justify-center">
                <div 
                    ref={demoScreenRef}
                    className="relative w-full max-w-md bg-gradient-to-br from-gray-900 to-black rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
                    style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                >
                    {/* Phone Frame */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />
                    
                    {/* Demo Content */}
                    <div className="p-6 pt-12">
                        {renderDemoContent()}
                        
                        {/* Action Button */}
                        <div className="mt-8">
                            <button 
                                className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                                onClick={() => handleDemoSwitch(activeDemo === 'transaction' ? 'transfer' : activeDemo === 'transfer' ? 'analytics' : 'transaction')}
                            >
                                Try Next Demo
                            </button>
                        </div>
                    </div>
                    
                    {/* Screen Glow */}
                    <div className="absolute inset-0 rounded-3xl opacity-20 bg-gradient-to-t from-indigo-500/20 to-transparent pointer-events-none" />
                </div>
            </div>

            {/* Interactive Hint */}
            <div className="text-center mt-12">
                <p className="text-sm text-gray-500">
                    Click the buttons above to switch between different demo modes
                </p>
            </div>
        </div>
    );
};

export default LiveDemo;
