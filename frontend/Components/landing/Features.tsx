'use client';

import { features } from '@/app/Constants';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
    const sectionRef = useRef<HTMLElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const tiltRefs = useRef<(HTMLDivElement | null)[]>([]);

    useGSAP(() => {
        // Section reveal animation
        gsap.fromTo(sectionRef.current,
            {
                opacity: 0,
                y: 100
            },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top 80%",
                    end: "bottom 20%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Title reveal with split text animation
        const titleChars = titleRef.current?.innerText.split('');
        if (titleRef.current && titleChars) {
            titleRef.current.innerHTML = titleChars.map(char => 
                char === ' ' ? '<span class="inline-block">&nbsp;</span>' : `<span class="inline-block char-reveal">${char}</span>`
            ).join('');

            gsap.fromTo('.char-reveal',
                {
                    opacity: 0,
                    y: 50,
                    rotationX: 90
                },
                {
                    opacity: 1,
                    y: 0,
                    rotationX: 0,
                    duration: 0.8,
                    stagger: 0.03,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: titleRef.current,
                        start: "top 85%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }

        // Subtitle fade-in
        gsap.fromTo(subtitleRef.current,
            {
                opacity: 0,
                y: 30,
                filter: 'blur(10px)'
            },
            {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 1,
                ease: "power2.out",
                delay: 0.3,
                scrollTrigger: {
                    trigger: subtitleRef.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Staggered card reveal
        gsap.fromTo(cardRefs.current,
            {
                opacity: 0,
                y: 80,
                scale: 0.8,
                rotationY: 45
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                rotationY: 0,
                duration: 1,
                stagger: 0.15,
                ease: "back.out(1.2)",
                scrollTrigger: {
                    trigger: cardRefs.current[0],
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Particle animations

    }, { scope: sectionRef });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent, tiltElement: HTMLDivElement) => {
            const card = tiltElement.querySelector('.card') as HTMLElement;
            const cardContent = tiltElement.querySelector('.card-content') as HTMLElement;
            if (!card) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 8;
            const rotateY = (centerX - x) / 8;

            const mouseXPercent = (x / rect.width) * 100;
            const mouseYPercent = (y / rect.height) * 100;

            card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            card.style.setProperty('--mouse-x', `${mouseXPercent}%`);
            card.style.setProperty('--mouse-y', `${mouseYPercent}%`);

            // Parallax content effect - move content at different speed
            if (cardContent) {
                const parallaxX = (x - centerX) * 0.05;
                const parallaxY = (y - centerY) * 0.05;
                cardContent.style.transform = `translateX(${parallaxX}px) translateY(${parallaxY}px)`;
            }
        };

        const handleMouseLeave = (tiltElement: HTMLDivElement) => {
            const card = tiltElement.querySelector('.card') as HTMLElement;
            const cardContent = tiltElement.querySelector('.card-content') as HTMLElement;
            if (!card) return;

            card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
            
            // Reset parallax content
            if (cardContent) {
                cardContent.style.transform = 'translateX(0) translateY(0)';
            }
        };

        const tiltElements = tiltRefs.current;
        tiltElements.forEach((element) => {
            if (element) {
                element.addEventListener('mousemove', (e) => handleMouseMove(e, element));
                element.addEventListener('mouseleave', () => handleMouseLeave(element));
            }
        });

        return () => {
            tiltElements.forEach((element) => {
                if (element) {
                    element.removeEventListener('mousemove', (e) => handleMouseMove(e, element));
                    element.removeEventListener('mouseleave', () => handleMouseLeave(element));
                }
            });
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            id="features"
            className="py-32 px-4 lg:px-12 relative min-h-screen flex items-center overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a1a2e 100%)' }}>

            {/* Gradient overlays */}
            <div className="first absolute inset-0 bg-linear-to-br from-purple-900/10 via-transparent to-blue-900/10" style={{ zIndex: -20 }} />
            <div className="second absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" style={{ zIndex: -15 }} />
            <div className="third absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" style={{ zIndex: -15 }} />

            <div className="max-w-7xl mx-auto w-full relative z-10">
                <div className="text-center mb-20">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <h2 ref={titleRef} className="text-5xl md:text-7xl font-black mb-6 text-white bg-linear-to-r from-white via-purple-200 to-blue-200 bg-clip-text">
                        Everything You Need
                    </h2>
                    <p className="text-xl max-w-2xl mx-auto text-gray-400 font-light blur-on-scroll">
                        {/*  filter: 'blur(10px)', opacity: 0 */}
                        Powerful features designed to help you manage your money effectively
                    </p>
                </div>
            </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;

                        return (
                            <div 
                                key={index} 
                                ref={(el) => {
                                    cardRefs.current[index] = el;
                                    tiltRefs.current[index] = el;
                                }}
                                className="three-d-tilt relative">
                                <div
                                    className="card group relative rounded-3xl p-8 backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
                                    style={{ 
                                        backgroundColor: feature.bgColor,
                                        boxShadow: `
                                            0 0 0 1px ${feature.color}10,
                                            0 4px 20px -4px ${feature.color}20,
                                            inset 0 1px 0 1px ${feature.color}30,
                                            inset 1px 0 0 1px ${feature.color}30
                                        `,
                                        background: `
                                            linear-gradient(135deg, ${feature.bgColor}, transparent),
                                            linear-gradient(225deg, ${feature.color}05, transparent)
                                        `
                                    }}>
                                    <div className="card-content relative z-10 transform-gpu transition-transform duration-200 ease-out">
                                        <div
                                            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-700 group-hover:scale-110 group-hover:rotate-12"
                                            style={{
                                                background: `linear-gradient(135deg, ${feature.color}30, ${feature.color}15)`,
                                                border: `1px solid ${feature.color}40`,
                                                boxShadow: `0 10px 30px -10px ${feature.color}50`
                                            }}>
                                            <Icon
                                                className="w-10 h-10 transition-transform duration-700 group-hover:scale-110"
                                                style={{ color: feature.color }}
                                            />
                                        </div>
                                        <h3 className="text-white text-2xl font-black mb-4 tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-400 leading-relaxed" style={{ opacity: 0.7, fontFamily: 'Inter, system-ui, sans-serif' }}>
                                            {feature.description}
                                        </p>
                                    </div>
                                    
                                    {/* Gradient bleed effect */}
                                    <div 
                                        className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
                                        style={{
                                            background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${feature.color}20, transparent 60%)`,
                                            filter: 'blur(30px)',
                                            zIndex: -1
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            </section>
    );
};

export default Features;
