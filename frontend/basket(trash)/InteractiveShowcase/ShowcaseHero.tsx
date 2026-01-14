'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useEffect } from 'react';
import { Sparkles, Zap, TrendingUp, Shield } from 'lucide-react';
import { colors } from '@/app/Constants';

const ShowcaseHero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const featuresRef = useRef<(HTMLDivElement | null)[]>([]);

    useGSAP(
        () => {
            if (!containerRef.current) return;

            // Title typewriter effect
            const titleText = "Revolutionary Finance Management";
            if (titleRef.current) {
                titleRef.current.innerHTML = "";
                const chars = titleText.split("");
                
                chars.forEach((char, index) => {
                    const span = document.createElement("span");
                    span.textContent = char === " " ? "\u00A0" : char;
                    span.style.opacity = "0";
                    span.style.display = "inline-block";
                    titleRef.current?.appendChild(span);
                    
                    gsap.to(span, {
                        opacity: 1,
                        y: 0,
                        duration: 0.05,
                        delay: index * 0.05,
                        ease: "power2.out",
                    });
                });
            }

            // Floating animation for feature cards
            featuresRef.current.forEach((feature, index) => {
                if (!feature) return;
                
                gsap.to(feature, {
                    y: -10,
                    duration: 2 + index * 0.5,
                    repeat: -1,
                    yoyo: true,
                    ease: "power1.inOut",
                    delay: index * 0.2,
                });
            });

            // Subtitle fade in
            if (subtitleRef.current) {
                gsap.fromTo(
                    subtitleRef.current,
                    { opacity: 0, y: 20 },
                    { 
                        opacity: 1, 
                        y: 0, 
                        duration: 1, 
                        delay: 1,
                        ease: "power2.out"
                    }
                );
            }
        },
        { scope: containerRef }
    );

    const features = [
        {
            icon: Sparkles,
            title: "Smart Analytics",
            description: "AI-powered insights",
            color: colors.primary,
        },
        {
            icon: Zap,
            title: "Lightning Fast",
            description: "Real-time updates",
            color: colors.secondary,
        },
        {
            icon: TrendingUp,
            title: "Growth Tracking",
            description: "Monitor progress",
            color: colors.accent,
        },
        {
            icon: Shield,
            title: "Bank-level Security",
            description: "Your data is safe",
            color: colors.info,
        },
    ];

    return (
        <div ref={containerRef} className="text-center py-16 lg:py-24">

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <div
                            key={index}
                            ref={(el) => {
                                featuresRef.current[index] = el;
                            }}
                            className="group relative p-6 lg:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:border-indigo-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/20"
                        >
                            {/* Glow effect on hover */}
                            <div 
                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"
                                style={{ backgroundColor: feature.color }}
                            />
                            
                            {/* Icon */}
                            <div className="relative mb-6 flex justify-center">
                                <div 
                                    className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: `${feature.color}20` }}
                                >
                                    <Icon 
                                        className="w-8 h-8 lg:w-10 lg:h-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                                        style={{ color: feature.color }}
                                    />
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="relative">
                                <h3 className="text-lg lg:text-xl font-bold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-sm lg:text-base text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                            
                            {/* Hover indicator */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent transition-all duration-500 group-hover:w-full" />
                        </div>
                    );
                })}
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
    );
};

export default ShowcaseHero;
