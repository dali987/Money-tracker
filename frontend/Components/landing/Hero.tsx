'use client';

import { colors } from '@/app/Constants';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger, SplitText } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger, SplitText);

const Hero = () => {
    useGSAP(() => {
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
    }, []);

    useGSAP(() => {
        // Set initial positions
        gsap.set('.parallax-slow', { y: -100, x: 0 });
        gsap.set('.parallax-fast', { y: 0, x: 0 });

        // Create parallax timeline with random directions
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        });

        // Animate orbs with random directions
        tl.to('.parallax-slow', { y: 250, x: -100 }, 0);
        tl.to('.parallax-fast', { y: 450, x: 150 }, 0);

        // Add a second parallax-slow element with different direction

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, []);

    useGSAP(() => {
        const splitTitle = new SplitText('.title', { type: 'words' });
        const splitSubtitle = new SplitText('#heroSubtitle', { type: 'words' });
        const titleElement = document.querySelector('.title');
        if (!titleElement) return;
        const titleBounds = titleElement.getBoundingClientRect();

        splitTitle.words.forEach((word) => {
            const wordBounds = word.getBoundingClientRect();

            gsap.set(word, {
                backgroundImage: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
                backgroundSize: `${titleBounds.width}px ${titleBounds.height}px`,
                backgroundPosition: `${titleBounds.left - wordBounds.left}px ${
                    titleBounds.top - wordBounds.top
                }px`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                display: 'inline-block',
            });
        });

        // REVEAL HERE: Now that styles are set, make the container visible and start animation
        gsap.set('.title', { opacity: 1 });

        gsap.from(splitTitle.words, {
            opacity: 0,
            y: 80,
            rotateX: -90,
            rotateY: 45,
            stagger: 0.05,
            duration: 1,
            ease: 'expo.out',
        });
        gsap.from(splitSubtitle.words, {
            opacity: 0,
            yPercent: 100,
            duration: 1.4,
            ease: 'expo.out',
            stagger: 0.05,
            delay: 0.6,
        });
    }, []);

    useGSAP(() => {
        // Button animations
        const magneticBtn = document.querySelector('.magnetic');
        const demoBtn = document.querySelector('.demo');

        gsap.from('.demo', {
            opacity: 0,
            scale: 0.8,
            y: 50,
            duration: 0.5,
            delay: 1.2,
            ease: 'expo.out',
        });

        gsap.from('.magnetic', {
            opacity: 0,
            y: 50,
            scale: 0.8,
            duration: 1,
            delay: 1.2,
            ease: 'expo.out',
        });

        if (magneticBtn) {
            // Magnetic effect for primary button
            magneticBtn.addEventListener('mousemove', (e: Event) => {
                const mouseEvent = e as MouseEvent;
                const rect = magneticBtn.getBoundingClientRect();
                const x = mouseEvent.clientX - rect.left - rect.width / 2;
                const y = mouseEvent.clientY - rect.top - rect.height / 2;

                gsap.to(magneticBtn, {
                    x: x * 0.15,
                    y: y * 0.15,
                    rotation: x * 0.02,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            });

            magneticBtn.addEventListener('mouseleave', () => {
                gsap.to(magneticBtn, {
                    x: 0,
                    y: 0,
                    rotation: 0,
                    duration: 0.5,
                    ease: 'power1.inOut',
                });
            });
        }

        if (demoBtn) {
            // Hover effect for demo button
            demoBtn.addEventListener('mouseenter', () => {
                gsap.to(demoBtn, {
                    scale: 1.05,
                    borderColor: colors.secondary,
                    backgroundColor: `${colors.primary}20`,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            });

            demoBtn.addEventListener('mouseleave', () => {
                gsap.to(demoBtn, {
                    scale: 1,
                    borderColor: colors.primary,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    duration: 0.3,
                    ease: 'power2.out',
                });
            });
        }
    }, []);

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center px-4 lg:px-12 py-20"
            style={{
                // Using a semi-transparent gradient to let some particles show through at the edges
                background: 'radial-gradient(ellipse at top, #1a1a2eE6, #000000 80%)',
            }}>
            {/* Animated gradient orbs with parallax */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="parallax-slow absolute top-20 left-10 w-150 h-150 rounded-full blur-3xl opacity-40"
                    style={{
                        background: `radial-gradient(circle, ${colors.primary}60, transparent 70%)`,
                    }}
                />
                <div
                    className="parallax-fast absolute bottom-20 right-10 w-175 h-175 rounded-full blur-3xl opacity-40"
                    style={{
                        background: `radial-gradient(circle, ${colors.secondary}60, transparent 100%)`,
                    }}
                />
                <div
                    className="parallax-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 rounded-full blur-3xl opacity-30"
                    style={{
                        background: `radial-gradient(circle, ${colors.accent}50, transparent 70%)`,
                    }}
                />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto text-center">
                <h1 className="title opacity-0 text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight">
                    Take Control of Your Finances
                </h1>
                <p
                    id="heroSubtitle"
                    className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-300 font-light">
                    The ultimate money tracking solution to manage accounts, track transactions,
                    analyze spending, and achieve your financial goals with ease.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <Link
                        href="/dashboard"
                        className="magnetic group relative px-10 py-7 rounded-full font-bold text-lg text-white overflow-hidden cursor-pointer"
                        style={{
                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        }}>
                        <span className="relative z-10 flex items-center">
                            Get Started Free
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </span>
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                                background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`,
                            }}
                        />
                    </Link>
                    <Link
                        href="/transactions"
                        className="demo px-10 py-7 rounded-full font-bold text-lg border-2 cursor-pointer bg-white/5 hover:bg-white/10"
                        style={{
                            borderColor: colors.primary,
                            color: 'white',
                        }}>
                        View Demo
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
