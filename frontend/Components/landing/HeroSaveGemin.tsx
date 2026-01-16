'use client';

import React, { useRef } from 'react';
import { colors } from '@/app/Constants';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger, SplitText } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger, SplitText);

const Hero = () => {
    const containerRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: '#hero',
                    start: 'top top',
                    scrub: true,
                    pin: true,
                    pinSpacing: false,
                },
            });
            timeline.to('#hero', {
                ease: 'none',
                startAt: { filter: 'brightness(100%) blur(0px)' },
                filter: 'brightness(50%) blur(10px)',
            });
        },
        { scope: containerRef }
    );

    useGSAP(
        () => {
            // Aurora / Mesh Gradient Animation

            // Randomize initial positions for a more organic feel
            gsap.set('.aurora-orb', {
                xPercent: -50,
                yPercent: -50,
                opacity: 0,
                transformOrigin: 'center center',
            });

            // Entrance for orbs
            gsap.to('.aurora-orb', {
                opacity: (i) => [0.6, 0.4, 0.4][i],
                duration: 3,
                stagger: 0.5,
                ease: 'power2.out',
            });

            // Continuous floating animation across the screen
            gsap.to('.aurora-1', {
                x: '35vw',
                y: '25vh',
                rotation: 360,
                scale: 1.5,
                duration: 25,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });

            gsap.to('.aurora-2', {
                x: '-35vw',
                y: '-25vh',
                rotation: -360,
                scale: 1.3,
                duration: 30,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });

            gsap.to('.aurora-3', {
                x: '10vw',
                y: '-35vh',
                scale: 1.7,
                duration: 22,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
            });
        },
        { scope: containerRef }
    );

    useGSAP(
        () => {
            // Title & Text Animation Strategy: "Solid Reveal"
            // 1. We removed opacity-0 from JSX to ensure content exists if JS fails.
            // 2. We set autoAlpha: 0 immediately here to hide it before splitting.
            // 3. We animate to autoAlpha: 1 for a smooth visibility toggle.

            const title = containerRef.current?.querySelector('.title') as HTMLElement;
            const subtitle = containerRef.current?.querySelector('#heroSubtitle') as HTMLElement;

            if (!title || !subtitle) return;

            // Initial safe hide
            gsap.set([title, subtitle], { autoAlpha: 0 });

            // Split text
            const splitTitle = new SplitText(title, { type: 'chars,words' });
            const splitSubtitle = new SplitText(subtitle, { type: 'words' });

            // Reveal Container Reference (make it visible so chars can be seen)
            gsap.set(title, { autoAlpha: 1 });

            // Set initial state for Chars (hidden and offset)
            gsap.set(splitTitle.chars, {
                opacity: 0,
                y: 80,
                rotateX: -90,
                transformOrigin: '0% 50% -50',
            });

            // Animate Chars
            gsap.to(splitTitle.chars, {
                opacity: 1,
                y: 0,
                rotateX: 0,
                stagger: 0.03,
                duration: 1,
                ease: 'back.out(1.7)',
                delay: 0.2, // Small delay to ensuring splitting is done
            });

            // Animate Subtitle
            gsap.to(subtitle, { autoAlpha: 1, duration: 0.1, delay: 0.8 });

            gsap.from(splitSubtitle.words, {
                opacity: 0,
                y: 20,
                filter: 'blur(10px)',
                duration: 0.8,
                ease: 'power2.out',
                stagger: 0.05,
                delay: 0.9,
            });
        },
        { scope: containerRef }
    );

    useGSAP(
        () => {
            // Button animations (Magnetic)
            const magneticBtn = containerRef.current?.querySelector('.magnetic') as HTMLElement;
            const magneticContent = containerRef.current?.querySelector(
                '.magnetic-content'
            ) as HTMLElement;

            if (magneticBtn) {
                const handleMouseMove = (e: MouseEvent) => {
                    const rect = magneticBtn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    gsap.to(magneticBtn, {
                        x: x * 0.2,
                        y: y * 0.2,
                        duration: 0.3,
                        ease: 'power2.out',
                    });

                    if (magneticContent) {
                        gsap.to(magneticContent, {
                            x: x * 0.1,
                            y: y * 0.1,
                            duration: 0.3,
                            ease: 'power2.out',
                        });
                    }
                };

                const handleMouseLeave = () => {
                    gsap.to([magneticBtn, magneticContent], {
                        x: 0,
                        y: 0,
                        duration: 0.5,
                        ease: 'elastic.out(1, 0.3)',
                    });
                };

                magneticBtn.addEventListener('mousemove', handleMouseMove as any);
                magneticBtn.addEventListener('mouseleave', handleMouseLeave);

                return () => {
                    magneticBtn.removeEventListener('mousemove', handleMouseMove as any);
                    magneticBtn.removeEventListener('mouseleave', handleMouseLeave);
                };
            }
        },
        { scope: containerRef }
    );

    // Seprate UseGSAP for Entrance animations to keep logic clean
    useGSAP(
        () => {
            gsap.from('.hero-btn', {
                y: 50,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                delay: 1.4,
                ease: 'power3.out',
            });
        },
        { scope: containerRef }
    );

    return (
        <section
            ref={containerRef}
            id="hero"
            className="relative min-h-screen flex items-center justify-center px-4 lg:px-12 py-20 overflow-hidden">
            {/* Aurora Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black">
                <div
                    className="aurora-orb aurora-1 absolute top-1/4 left-1/4 w-[65vw] h-[65vw] rounded-full mix-blend-screen filter blur-[100px]"
                    style={{
                        background: `radial-gradient(circle, ${colors.primary}, transparent 75%)`,
                    }}
                />
                <div
                    className="aurora-orb aurora-2 absolute top-3/4 left-3/4 w-[55vw] h-[55vw] rounded-full mix-blend-screen filter blur-[120px]"
                    style={{
                        background: `radial-gradient(circle, ${colors.secondary}, transparent 75%)`,
                    }}
                />
                <div
                    className="aurora-orb aurora-3 absolute top-1/2 left-1/2 w-[75vw] h-[75vw] rounded-full mix-blend-screen filter blur-[90px]"
                    style={{
                        background: `radial-gradient(circle, ${colors.accent}, transparent 75%)`,
                    }}
                />

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent,rgba(0,0,0,0.4),rgba(0,0,0,1))] z-10" />
            </div>

            <div className="relative z-20 max-w-7xl mx-auto text-center">
                <h1 className="title text-7xl md:text-9xl lg:text-[11rem] font-black mb-8 leading-[0.85] tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-white/60">
                    Take Control
                    <br />
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 via-white to-indigo-300">
                        Of Finances
                    </span>
                </h1>

                <p
                    id="heroSubtitle"
                    className="text-lg md:text-2xl mb-12 max-w-2xl mx-auto leading-relaxed text-gray-400 font-light tracking-wide">
                    The ultimate money tracking solution. Track transactions, analyze spending, and
                    achieve financial clarity.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link
                        href="/dashboard"
                        className="hero-btn magnetic group relative px-8 py-6 rounded-full font-bold text-lg text-white overflow-hidden cursor-pointer bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-colors">
                        <span className="magnetic-content relative z-10 flex items-center gap-2">
                            Get Started Free
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </Link>

                    <Link
                        href="/transactions"
                        className="hero-btn px-8 py-6 rounded-full font-bold text-lg text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                        <span>View Demo</span>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
