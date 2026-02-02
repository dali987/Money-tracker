'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Image from 'next/image';

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
                const x = (clientX / window.innerWidth - 0.5) * 2; // Normalize -1 to 1
                const y = (clientY / window.innerHeight - 0.5) * 2;

                // Move mockup content
                gsap.to(mockupRef.current, {
                    rotationY: x * 15, // Increased rotation
                    rotationX: -y * 10,
                    x: x * 20,
                    duration: 1,
                    ease: 'power2.out',
                    transformPerspective: 1000,
                });

                // Move cards with parallax
                gsap.to(card1Ref.current, {
                    x: x * 40,
                    y: y * 40,
                    rotation: x * 5,
                    duration: 1.2,
                    ease: 'power2.out',
                });
                gsap.to(card2Ref.current, {
                    x: x * -30,
                    y: y * -30,
                    rotation: -x * 5,
                    duration: 1.2,
                    ease: 'power2.out',
                });
                gsap.to(card3Ref.current, {
                    x: x * 20,
                    y: y * 20,
                    rotation: x * 2,
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

                <div
                    className="relative max-w-5xl mx-auto perspective-1000"
                    style={{ perspective: '1200px' }}>
                    {/* Main Dashboard Mockup */}
                    <div
                        ref={mockupRef}
                        className="mockup-browser border border-white/10 bg-base-300 w-full shadow-2xl shadow-indigo-500/20 transform-style-3d relative z-10"
                        style={{ transformStyle: 'preserve-3d' }}>
                        <div className="mockup-browser-toolbar">
                            <div className="input border border-white/10">
                                https://money-tracker.app
                            </div>
                        </div>
                        <div className="relative bg-base-200/50 backdrop-blur-sm overflow-hidden aspect-video group">
                            <Image
                                src="/exampleOfSite.png"
                                alt="Money Tracker Dashboard"
                                className="w-full h-full object-cover object-top transition-transform duration-700"
                                width={1920}
                                height={1080}
                            />
                            {/* Subtle overlay for depth */}
                            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        </div>
                    </div>

                    {/* Reflection */}
                    <div
                        className="absolute top-full left-0 w-full h-full opacity-30 pointer-events-none -scale-y-100 origin-top blur-sm transition-transform duration-100" // Added transition for smoothness
                        style={{
                            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), transparent)',
                            WebkitMaskImage:
                                'linear-gradient    (to bottom, rgba(0,0,0,1), transparent)',
                            transform: 'scaleY(-1) translateY(0px)', // Adjust gap as needed
                            zIndex: 0,
                        }}>
                        {/* We duplicate the visual content for reflection - simplified for performance */}
                        <div className="w-full h-full bg-linear-to-b from-indigo-900/50 to-transparent rounded-xl" />

                        <Image
                            src="/exampleOfSite.png"
                            alt=""
                            className="w-full h-full object-cover object-top opacity-50"
                            width={1920}
                            height={1080}
                        />
                    </div>

                    {/* Floating Stats Cards */}
                    <div
                        ref={card1Ref}
                        className="absolute -top-10 -right-10 md:-right-20 bg-black/80 backdrop-blur-md border border-white/10 p-3 md:p-6 rounded-xl md:rounded-2xl shadow-xl z-20 w-36 md:w-64 transform-gpu">
                        <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-2">
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                ↗
                            </div>
                            <div>
                                <div className="text-xs text-gray-400">Total Savings</div>
                                <div className="text-lg md:text-2xl font-bold text-white">$24,500</div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-800 h-1 md:h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[75%]"></div>
                        </div>
                    </div>

                    <div
                        ref={card2Ref}
                        className="absolute top-1/2 -left-10 md:-left-20 bg-black/80 backdrop-blur-md border border-white/10 p-3 md:p-6 rounded-xl md:rounded-2xl shadow-xl z-20 w-36 md:w-64 transform-gpu">
                        <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-2">
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                📊
                            </div>
                            <div>
                                <div className="text-xs text-gray-400">Monthly Goal</div>
                                <div className="text-base md:text-xl font-bold text-white">85% Hit</div>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={card3Ref}
                        className="absolute -bottom-10 -right-5 md:right-10 bg-black/80 backdrop-blur-md border border-white/10 p-3 md:p-6 rounded-xl md:rounded-2xl shadow-xl z-20 w-36 md:w-64 transform-gpu">
                        <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-2">
                            <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                📊
                            </div>
                            <div>
                                <div className="text-xs text-gray-400">Expenses</div>
                                <div className="text-base md:text-xl font-bold text-white">- $1,250</div>
                            </div>
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
