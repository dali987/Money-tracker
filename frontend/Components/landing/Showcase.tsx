'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { colors } from '@/app/Constants';

gsap.registerPlugin(ScrollTrigger);

const Showcase = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const mockupRef = useRef<HTMLDivElement>(null);
    const card1Ref = useRef<HTMLDivElement>(null);
    const card2Ref = useRef<HTMLDivElement>(null);
    const card3Ref = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                },
            });

            // Entrance animation
            tl.from(contentRef.current, {
                y: 100,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            })
                .from(
                    mockupRef.current,
                    {
                        y: 50,
                        opacity: 0,
                        rotateX: 10,
                        scale: 0.9,
                        duration: 1.2,
                        ease: 'power4.out',
                    },
                    '-=0.8'
                )
                .from(
                    [card1Ref.current, card2Ref.current, card3Ref.current],
                    {
                        y: 30,
                        opacity: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        ease: 'back.out(1.7)',
                    },
                    '-=1'
                );

            // Floating/Parallax effect on mouse move
            const handleMouseMove = (e: MouseEvent) => {
                if (!sectionRef.current) return;
                const { clientX, clientY } = e;
                const x = (clientX / window.innerWidth - 0.5) * 20;
                const y = (clientY / window.innerHeight - 0.5) * 20;

                gsap.to(mockupRef.current, {
                    rotateY: x,
                    rotateX: -y,
                    duration: 1,
                    ease: 'power2.out',
                });

                gsap.to(card1Ref.current, {
                    x: x * 1.5,
                    y: y * 1.5,
                    duration: 1.2,
                    ease: 'power2.out',
                });
                gsap.to(card2Ref.current, {
                    x: x * -1.2,
                    y: y * -1.2,
                    duration: 1.2,
                    ease: 'power2.out',
                });
                gsap.to(card3Ref.current, {
                    x: x * 0.8,
                    y: y * 0.8,
                    duration: 1.2,
                    ease: 'power2.out',
                });
            };

            window.addEventListener('mousemove', handleMouseMove);

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
            };
        },
        { scope: sectionRef }
    );

    return (
        <section
            ref={sectionRef}
            className="min-h-screen py-24 relative flex items-center justify-center overflow-hidden"
            style={{
                // Semi-transparent to show global particles
                background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.8) 80%, transparent)`,
            }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05),transparent_50%)] pointer-events-none" />

            <div className="container mx-auto px-4 z-10">
                <div ref={contentRef} className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-white to-gray-500">
                        Experience Financial Clarity
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Your entire financial life, visualized in one beautiful dashboard. Track,
                        analyze, and optimize with precision.
                    </p>
                </div>

                <div className="relative max-w-5xl mx-auto perspective-1000">
                    {/* Main Dashboard Mockup */}
                    <div
                        ref={mockupRef}
                        className="mockup-browser border border-white/10 bg-base-300 w-full shadow-2xl shadow-(--color-primary)/20 transform-style-3d"
                        style={{ transformStyle: 'preserve-3d' }}>
                        <div className="mockup-browser-toolbar">
                            <div className="input border border-white/10">
                                https://money-tracker.app
                            </div>
                        </div>
                        <div className="flex justify-center px-4 py-16 bg-base-200/50 backdrop-blur-sm relative overflow-hidden">
                            {/* Abstract UI representation within the mockup for "Skeleton" look */}
                            <div className="w-full h-96 flex flex-col gap-4">
                                <div className="flex gap-4 h-1/3">
                                    <div className="w-2/3 bg-white/5 rounded-xl animate-pulse"></div>
                                    <div className="w-1/3 bg-white/5 rounded-xl animate-pulse"></div>
                                </div>
                                <div className="flex gap-4 h-2/3">
                                    <div className="w-1/3 bg-white/5 rounded-xl animate-pulse"></div>
                                    <div className="w-2/3 bg-white/5 rounded-xl animate-pulse"></div>
                                </div>
                            </div>

                            {/* Overlay Text for the Mockup */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-bold opacity-20 rotate-[-15deg]">
                                    Dashboard Preview
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Floating Stats Cards */}
                    <div
                        ref={card1Ref}
                        className="absolute -top-10 -right-10 md:-right-20 bg-black/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl z-20 w-64">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                ↗
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Total Savings</div>
                                <div className="text-2xl font-bold text-white">$24,500</div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[75%]"></div>
                        </div>
                    </div>

                    <div
                        ref={card2Ref}
                        className="absolute top-1/2 -left-10 md:-left-20 bg-black/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl z-20 w-56">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                📊
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Monthly Goal</div>
                                <div className="text-xl font-bold text-white">85% Hit</div>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={card3Ref}
                        className="absolute -bottom-10 -right-5 md:right-10 bg-black/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl z-20 w-60">
                        <div className="flex justify-between items-end mb-2">
                            <div className="text-sm text-gray-400">Expenses</div>
                            <div className="text-red-400 font-mono">- $1,250</div>
                        </div>
                        <div className="flex gap-1 h-8 items-end">
                            <div className="w-1/5 bg-gray-700 h-[30%] rounded-sm"></div>
                            <div className="w-1/5 bg-gray-700 h-[50%] rounded-sm"></div>
                            <div className="w-1/5 bg-red-500 h-[80%] rounded-sm"></div>
                            <div className="w-1/5 bg-gray-700 h-[40%] rounded-sm"></div>
                            <div className="w-1/5 bg-gray-700 h-[60%] rounded-sm"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-b from-black to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-black to-transparent pointer-events-none"></div>
        </section>
    );
};

export default Showcase;
