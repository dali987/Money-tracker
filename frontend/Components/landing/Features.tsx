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

    useGSAP(
        () => {
            // Section reveal animation
            gsap.fromTo(
                sectionRef.current,
                {
                    opacity: 0,
                    y: 100,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Title reveal with split text animation
            const titleChars = titleRef.current?.innerText.split('');
            if (titleRef.current && titleChars) {
                titleRef.current.innerHTML = titleChars
                    .map((char) =>
                        char === ' '
                            ? '<span class="inline-block">&nbsp;</span>'
                            : `<span class="inline-block char-reveal">${char}</span>`
                    )
                    .join('');

                gsap.fromTo(
                    '.char-reveal',
                    {
                        opacity: 0,
                        y: 50,
                        rotationX: 90,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        rotationX: 0,
                        duration: 0.8,
                        stagger: 0.03,
                        ease: 'back.out(1.7)',
                        scrollTrigger: {
                            trigger: titleRef.current,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }

            // Subtitle fade-in
            gsap.fromTo(
                subtitleRef.current,
                {
                    opacity: 0,
                    y: 30,
                    filter: 'blur(10px)',
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 1,
                    ease: 'power2.out',
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: subtitleRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Staggered card reveal
            gsap.fromTo(
                cardRefs.current,
                {
                    opacity: 0,
                    y: 80,
                    scale: 0.8,
                    rotationY: 45,
                },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotationY: 0,
                    duration: 1,
                    stagger: 0.15,
                    ease: 'back.out(1.2)',
                    scrollTrigger: {
                        trigger: cardRefs.current[0],
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Particle animations
        },
        { scope: sectionRef }
    );

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent, tiltElement: HTMLDivElement, index: number) => {
            const card = tiltElement.querySelector('.card') as HTMLElement;
            const cardContent = tiltElement.querySelector('.card-content') as HTMLElement;
            const isLarge = index % 4 === 0 || index % 4 === 3;

            if (!card) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / (isLarge ? 80 : 8);
            const rotateY = (centerX - x) / (isLarge ? 80 : 8);

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
        tiltElements.forEach((element, index) => {
            if (element) {
                element.addEventListener('mousemove', (e) => handleMouseMove(e, element, index));
                element.addEventListener('mouseleave', () => handleMouseLeave(element));
            }
        });

        return () => {
            tiltElements.forEach((element, index) => {
                if (element) {
                    element.removeEventListener('mousemove', (e) => handleMouseMove(e, element, index));
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
            // Keeping it largely transparent for particles, but adding a subtle gradient for readability
            style={{
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8), transparent)',
            }}>
            {/* Subtle Gradient overlays */}
            <div
                className="first absolute inset-0 bg-linear-to-br from-purple-900/10 via-transparent to-blue-900/10 pointer-events-none"
                style={{ zIndex: -20 }}
            />

            <div className="max-w-7xl mx-auto w-full relative z-10">
                <div className="text-center mb-20">
                    <div className="flex flex-col items-center justify-center mb-6">
                        <h2
                            ref={titleRef}
                            className="text-5xl md:text-7xl font-black mb-6 text-white bg-linear-to-r from-white via-purple-200 to-blue-200 bg-clip-text">
                            Everything You Need
                        </h2>
                        <p className="text-xl max-w-2xl mx-auto text-gray-400 font-light blur-on-scroll">
                            {/*  filter: 'blur(10px)', opacity: 0 */}
                            Powerful features designed to help you manage your money effectively
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        // Bento Grid Logic: Zig-Zag pattern (2+1, 1+2, 2+1)
                        const isLarge = index % 4 === 0 || index % 4 === 3;
                        const colSpanClass = isLarge ? 'md:col-span-2' : 'md:col-span-1';

                        return (
                            <div
                                key={index}
                                ref={(el) => {
                                    cardRefs.current[index] = el;
                                    tiltRefs.current[index] = el;
                                }}
                                className={`three-d-tilt relative ${colSpanClass}`}>
                                <div
                                    className="card group relative h-full rounded-3xl p-8 lg:p-10 backdrop-blur-3xl border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
                                    style={{
                                        backgroundColor: feature.bgColor,
                                        boxShadow: `
                                            0 0 0 1px ${feature.color}10,
                                            0 10px 40px -10px ${feature.color}20,
                                            inset 0 1px 0 1px ${feature.color}30
                                        `,
                                        background: `
                                            linear-gradient(135deg, ${feature.bgColor}, transparent),
                                            linear-gradient(225deg, ${feature.color}05, transparent)
                                        `,
                                    }}>
                                    <div className="card-content relative z-10 flex flex-col h-full transform-gpu transition-transform duration-200 ease-out">
                                        <div className="flex items-start justify-between mb-8">
                                            <div
                                                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 bg-white/5 border border-white/10"
                                                style={{
                                                    boxShadow: `0 0 30px -5px ${feature.color}40`,
                                                }}>
                                                <Icon
                                                    className="w-8 h-8 transition-transform duration-700 group-hover:scale-110"
                                                    style={{ color: feature.color }}
                                                />
                                            </div>
                                            {isLarge && (
                                                <div className="hidden lg:block">
                                                    <span className="text-xs font-mono uppercase tracking-widest text-white/20 border border-white/10 px-3 py-1 rounded-full">
                                                        Feature {index + 1}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <h3
                                            className="text-white text-2xl lg:text-3xl font-black mb-4 tracking-tight"
                                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                            {feature.title}
                                        </h3>
                                        <p
                                            className="text-gray-400 leading-relaxed text-base lg:text-lg"
                                            style={{
                                                opacity: 0.8,
                                                fontFamily: 'Inter, system-ui, sans-serif',
                                                maxWidth: isLarge ? '80%' : '100%',
                                            }}>
                                            {feature.description}
                                        </p>

                                        {/* Decorative elements for large cards */}
                                        {isLarge && (
                                            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
                                                <Icon size={300} color={feature.color} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Gradient bleed effect */}
                                    <div
                                        className="absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
                                        style={{
                                            background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${feature.color}20, transparent 60%)`,
                                            filter: 'blur(40px)',
                                            zIndex: -1,
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
