'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useEffect, useState } from 'react';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { 
    Users, 
    TrendingUp, 
    Shield, 
    Globe,
    Zap,
    Award
} from 'lucide-react';
import { colors } from '@/app/Constants';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const AnimatedNumber = ({ 
    target, 
    duration = 2, 
    suffix = '', 
    prefix = '',
    decimal = false 
}: { 
    target: number; 
    duration?: number; 
    suffix?: string; 
    prefix?: string;
    decimal?: boolean;
}) => {
    const [current, setCurrent] = useState(0);
    const numberRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        gsap.to({ value: 0 }, {
                            value: target,
                            duration,
                            ease: "power2.out",
                            onUpdate: function() {
                                const value = this.targets()[0].value;
                                const displayValue = decimal ? value.toFixed(1) : Math.floor(value);
                                setCurrent(displayValue);
                            },
                        });
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (numberRef.current) {
            observer.observe(numberRef.current);
        }

        return () => observer.disconnect();
    }, [target, duration, decimal]);

    return (
        <span ref={numberRef}>
            {prefix}{current}{suffix}
        </span>
    );
};

const CircularProgress = ({ 
    percentage, 
    color, 
    size = 120 
}: { 
    percentage: number; 
    color: string; 
    size?: number;
}) => {
    const [progress, setProgress] = useState(0);
    const circleRef = useRef<SVGCircleElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        gsap.to({ value: 0 }, {
                            value: percentage,
                            duration: 2,
                            ease: "power2.out",
                            onUpdate: function() {
                                setProgress(this.targets()[0].value);
                            },
                        });
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (circleRef.current) {
            observer.observe(circleRef.current);
        }

        return () => observer.disconnect();
    }, [percentage]);

    const radius = (size - 10) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="5"
                    fill="none"
                />
                {/* Progress circle */}
                <circle
                    ref={circleRef}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth="5"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.3s ease',
                    }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
            </div>
        </div>
    );
};

const StatsCounter = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<(HTMLDivElement | null)[]>([]);

    const stats = [
        {
            icon: Users,
            value: 50000,
            label: "Active Users",
            prefix: "",
            suffix: "+",
            color: colors.primary,
            description: "Trusted by thousands worldwide",
            growth: "+25% this month",
        },
        {
            icon: TrendingUp,
            value: 98.5,
            label: "Success Rate",
            prefix: "",
            suffix: "%",
            color: colors.secondary,
            description: "Users achieving financial goals",
            growth: "+5% improvement",
            decimal: true,
        },
        {
            icon: Shield,
            value: 100,
            label: "Security Score",
            prefix: "",
            suffix: "%",
            color: colors.info,
            description: "Bank-level encryption standards",
            growth: "Industry leading",
        },
        {
            icon: Globe,
            value: 150,
            label: "Countries",
            prefix: "",
            suffix: "+",
            color: colors.accent,
            description: "Global user presence",
            growth: "+30 new countries",
        },
        {
            icon: Zap,
            value: 99.9,
            label: "Uptime",
            prefix: "",
            suffix: "%",
            color: colors.warning,
            description: "Reliable service availability",
            growth: "Consistent performance",
            decimal: true,
        },
        {
            icon: Award,
            value: 4.9,
            label: "User Rating",
            prefix: "",
            suffix: "/5.0",
            color: colors.success,
            description: "Average user satisfaction",
            growth: "Based on 10k+ reviews",
            decimal: true,
        },
    ];

    useGSAP(
        () => {
            if (!containerRef.current) return;

            // Stats entrance animation
            statsRef.current.forEach((stat, index) => {
                if (!stat) return;
                
                gsap.fromTo(
                    stat,
                    {
                        opacity: 0,
                        y: 50,
                        scale: 0.9,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: stat,
                            start: 'top 85%',
                            end: 'bottom 15%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            });

            // Floating animation for stats
            statsRef.current.forEach((stat, index) => {
                if (!stat) return;
                
                gsap.to(stat, {
                    y: -5,
                    duration: 2 + index * 0.3,
                    repeat: -1,
                    yoyo: true,
                    ease: "power1.inOut",
                    delay: index * 0.2,
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
                    Impact by the{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-400">
                        Numbers
                    </span>
                </h3>
                <p className="text-lg lg:text-2xl text-gray-400 max-w-3xl mx-auto">
                    Real metrics that show our commitment to your financial success
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    
                    return (
                        <div
                            key={index}
                            ref={(el) => {
                                statsRef.current[index] = el;
                            }}
                            className="group relative p-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-lg hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20"
                        >
                            {/* Icon */}
                            <div className="mb-6">
                                <div 
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                                    style={{ backgroundColor: `${stat.color}20` }}
                                >
                                    <Icon 
                                        className="w-8 h-8 transition-transform duration-300"
                                        style={{ color: stat.color }}
                                    />
                                </div>
                            </div>

                            {/* Main Stat */}
                            <div className="mb-4">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl lg:text-5xl font-black text-white leading-none">
                                        <AnimatedNumber 
                                            target={stat.value} 
                                            prefix={stat.prefix}
                                            suffix={stat.suffix}
                                            decimal={stat.decimal}
                                        />
                                    </span>
                                </div>
                                <h4 className="text-xl lg:text-2xl font-bold text-white">
                                    {stat.label}
                                </h4>
                            </div>

                            {/* Description */}
                            <p className="text-gray-400 mb-4 leading-relaxed">
                                {stat.description}
                            </p>

                            {/* Growth Indicator */}
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm text-green-500 font-medium">
                                    {stat.growth}
                                </span>
                            </div>

                            {/* Progress Circle for percentage stats */}
                            {stat.suffix === '%' && (
                                <div className="absolute top-4 right-4">
                                    <CircularProgress 
                                        percentage={stat.value} 
                                        color={stat.color}
                                        size={60}
                                    />
                                </div>
                            )}

                            {/* Glow effect */}
                            <div 
                                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"
                                style={{ backgroundColor: stat.color }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
                <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 rounded-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white font-bold">Live Statistics</span>
                    </div>
                    <div className="text-gray-400">•</div>
                    <span className="text-gray-300">Updated in real-time</span>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-green-500/10 blur-3xl" />
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
    );
};

export default StatsCounter;
