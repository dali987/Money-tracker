'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger);

const CTA = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const magneticBtn = useRef<HTMLAnchorElement>(null);

    useGSAP(
        () => {
            if (magneticBtn.current) {
                // Magnetic effect for primary button

                magneticBtn.current.addEventListener('mousemove', (e: MouseEvent) => {
                    const mouseEvent = e as MouseEvent;
                    const rect = magneticBtn.current!.getBoundingClientRect();
                    const x = mouseEvent.clientX - rect.left - rect.width / 2;
                    const y = mouseEvent.clientY - rect.top - rect.height / 2;

                    gsap.to(magneticBtn.current!, {
                        x: x * 0.15,
                        y: y * 0.15,
                        rotation: x * 0.02,
                        duration: 0.3,
                        ease: 'power2.out',
                    });
                });

                magneticBtn.current.addEventListener('mouseleave', () => {
                    gsap.to(magneticBtn.current, {
                        x: 0,
                        y: 0,
                        rotation: 0,
                        duration: 0.5,
                        ease: 'power1.inOut',
                    });
                });
            }

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                },
            });

            // Animate container scale and opacity
            tl.from(containerRef.current, {
                scale: 0.9,
                opacity: 0,
                duration: 1,
                ease: 'power3.out',
            });

            // Animate content elements stagger
            tl.from(
                contentRef.current?.children || [],
                {
                    y: 30,
                    opacity: 0,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: 'back.out(1.7)',
                },
                '-=0.5'
            );

            // Continuous glow pulse
            gsap.to(glowRef.current, {
                opacity: 0.6,
                scale: 1.2,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        },
        { scope: containerRef }
    );

    return (
        <section className="py-32 px-4 lg:px-12 relative min-h-[70vh] flex items-center justify-center overflow-hidden">
            {/* Background elements - kept minimal to let global particles show through */}

            <div ref={containerRef} className="max-w-5xl mx-auto w-full relative z-10 group">
                {/* Glow effect */}
                <div
                    ref={glowRef}
                    className="absolute -inset-1 rounded-[3rem] bg-linear-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000"
                />

                <div
                    className="relative rounded-[2.5rem] p-12 md:p-24 border border-white/10 overflow-hidden backdrop-blur-2xl bg-black/40"
                    style={{
                        boxShadow: '0 0 80px -20px rgba(99, 102, 241, 0.2)',
                    }}>
                    {/* Inner sheen */}
                    <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

                    <div
                        ref={contentRef}
                        className="relative z-10 flex flex-col items-center text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-gray-300">
                                Join the movement
                            </span>
                        </div>

                        <h2 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 text-white tracking-tight leading-[0.9]">
                            Start Your <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-purple-400 to-pink-400">
                                Financial Journey
                            </span>
                        </h2>

                        <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-gray-400 font-light leading-relaxed">
                            Stop guessing where your money goes. Take control with the most
                            intuitive tracker built for modern life.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 items-center w-full justify-center">
                            <Link
                                href="/dashboard"
                                ref={magneticBtn}
                                className="group relative px-10 py-6 rounded-2xl bg-white text-black font-bold text-lg overflow-hidden">
                                <span className="relative z-10 flex items-center gap-2">
                                    Get Started Free
                                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </span>
                                <div className="absolute inset-0 bg-linear-to-r from-indigo-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>

                            <Link
                                href="/login"
                                className="px-10 py-6 rounded-2xl border border-white/10 bg-white/5 text-white font-bold text-lg hover:bg-white/10 transition-all hover:scale-105 active:scale-95 backdrop-blur-md">
                                Sign In
                            </Link>
                        </div>

                        <p className="mt-8 text-sm text-gray-500">
                            No credit card required · Free plan forever
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
