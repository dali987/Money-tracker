'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';
import { 
    Wallet, 
    BarChart3, 
    Shield, 
    Globe, 
    PieChart, 
    Zap,
    ArrowRight,
    CheckCircle
} from 'lucide-react';
import { colors } from '@/app/Constants';

const FeatureShowcase = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            icon: Wallet,
            title: "Multi-Account Management",
            description: "Seamlessly manage cash, bank, credit, and custom accounts in one unified dashboard.",
            benefits: ["Unlimited accounts", "Custom categories", "Account transfers"],
            color: colors.primary,
            demo: "View all accounts in real-time with instant balance updates.",
        },
        {
            icon: BarChart3,
            title: "Advanced Analytics",
            description: "Get deep insights into your spending patterns with interactive charts and AI-powered recommendations.",
            benefits: ["Spending trends", "Category analysis", "Future projections"],
            color: colors.secondary,
            demo: "Visualize your financial data with beautiful, interactive charts.",
        },
        {
            icon: Shield,
            title: "Bank-Level Security",
            description: "Your financial data is protected with enterprise-grade encryption and security measures.",
            benefits: ["256-bit encryption", "Biometric access", "Regular backups"],
            color: colors.info,
            demo: "Rest easy knowing your data is secure and private.",
        },
        {
            icon: Globe,
            title: "Multi-Currency Support",
            description: "Handle multiple currencies with real-time exchange rates and automatic conversions.",
            benefits: ["150+ currencies", "Live rates", "Auto-conversion"],
            color: colors.accent,
            demo: "Manage global finances with automatic currency conversion.",
        },
        {
            icon: PieChart,
            title: "Smart Budgeting",
            description: "Set intelligent budgets and track your progress with visual indicators and alerts.",
            benefits: ["Custom budgets", "Spending alerts", "Goal tracking"],
            color: colors.success,
            demo: "Achieve your financial goals with smart budget planning.",
        },
        {
            icon: Zap,
            title: "Lightning Fast",
            description: "Experience instant updates and smooth performance across all devices.",
            benefits: ["Real-time sync", "Offline mode", "Quick entry"],
            color: colors.warning,
            demo: "Blazing fast performance for all your financial tasks.",
        },
    ];

    useGSAP(
        () => {
            if (!containerRef.current) return;

            // Card entrance animations
            cardsRef.current.forEach((card, index) => {
                if (!card) return;
                
                gsap.fromTo(
                    card,
                    {
                        opacity: 0,
                        y: 50,
                        scale: 0.9,
                        rotateX: -10,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotateX: 0,
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: "power3.out",
                    }
                );
            });

            // Hover effect enhancement
            cardsRef.current.forEach((card) => {
                if (!card) return;
                
                card.addEventListener('mouseenter', () => {
                    gsap.to(card, {
                        scale: 1.05,
                        y: -10,
                        duration: 0.3,
                        ease: "power2.out",
                    });
                });

                card.addEventListener('mouseleave', () => {
                    gsap.to(card, {
                        scale: 1,
                        y: 0,
                        duration: 0.3,
                        ease: "power2.out",
                    });
                });
            });
        },
        { scope: containerRef }
    );

    return (
        <div ref={containerRef} className="py-16 lg:py-24">
            {/* Section Header */}
            <div className="text-center mb-16 lg:mb-20">
                <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                    Powerful{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-400">
                        Features
                    </span>
                </h3>
                <p className="text-lg lg:text-2xl text-gray-400 max-w-3xl mx-auto">
                    Everything you need to take control of your financial future
                </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    const isActive = activeFeature === index;
                    
                    return (
                        <div
                            key={index}
                            ref={(el) => {
                                cardsRef.current[index] = el;
                            }}
                            className={`group relative p-8 rounded-3xl border transition-all duration-500 cursor-pointer ${
                                isActive 
                                    ? 'bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border-indigo-500/50 shadow-2xl shadow-indigo-500/20' 
                                    : 'bg-white/5 border-white/10 hover:border-indigo-500/30 hover:bg-white/10'
                            }`}
                            onClick={() => setActiveFeature(index)}
                        >
                            {/* Active indicator */}
                            {isActive && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                            )}

                            {/* Icon */}
                            <div className="mb-6">
                                <div 
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                                    style={{ backgroundColor: `${feature.color}20` }}
                                >
                                    <Icon 
                                        className="w-8 h-8 transition-transform duration-300 group-hover:rotate-6"
                                        style={{ color: feature.color }}
                                    />
                                </div>
                            </div>

                            {/* Content */}
                            <h4 className="text-xl lg:text-2xl font-bold text-white mb-4">
                                {feature.title}
                            </h4>
                            
                            <p className="text-gray-400 mb-6 leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Benefits List */}
                            <div className="space-y-2 mb-6">
                                {feature.benefits.map((benefit, benefitIndex) => (
                                    <div key={benefitIndex} className="flex items-center gap-3">
                                        <div 
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: feature.color }}
                                        />
                                        <span className="text-sm text-gray-300">{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Demo Text */}
                            <div className="text-sm text-gray-500 italic mb-6">
                                {feature.demo}
                            </div>

                            {/* CTA */}
                            <div className="flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                <span className="font-semibold">Learn more</span>
                                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                            </div>

                            {/* Glow effect */}
                            <div 
                                className={`absolute inset-0 rounded-3xl transition-opacity duration-500 blur-xl ${
                                    isActive ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
                                }`}
                                style={{ backgroundColor: feature.color }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Interactive Hint */}
            <div className="text-center mt-12">
                <p className="text-sm text-gray-500">
                    Click any feature card to explore • Hover for interactive effects
                </p>
            </div>
        </div>
    );
};

export default FeatureShowcase;
