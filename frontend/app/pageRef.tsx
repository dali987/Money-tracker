'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger, SplitText } from 'gsap/all';
import Link from 'next/link';
import {
    Wallet,
    BarChart3,
    Shield,
    Zap,
    Target,
    ArrowRight,
    CheckCircle2,
    DollarSign,
    PieChart,
    FileText,
    TrendingUp,
    Globe,
    Plus,
    ArrowLeftRight,
    Sparkles,
    Clock,
    Lock,
    Eye,
    TrendingDown,
    Users,
    Award,
    Play,
    Circle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Custom color palette for professional financial app
const colors = {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',
    secondary: '#10b981',
    secondaryDark: '#059669',
    secondaryLight: '#34d399',
    accent: '#f59e0b',
    accentDark: '#d97706',
    accentLight: '#fbbf24',
    success: '#22c55e',
    info: '#3b82f6',
    warning: '#f59e0b',
    error: '#ef4444',
    gradientStart: '#6366f1',
    gradientMid: '#8b5cf6',
    gradientEnd: '#ec4899',
    text: '#1f2937',
    textLight: '#6b7280',
    bg: '#ffffff',
    bgSecondary: '#f9fafb',
    bgTertiary: '#f3f4f6',
};

// Particle system component
const ParticleSystem = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Array<{
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
        color: string;
        opacity: number;
    }>>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Create particles
        const particleCount = 80;
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 3 + 1,
            color: [colors.primary, colors.secondary, colors.accent, colors.info][Math.floor(Math.random() * 4)],
            opacity: Math.random() * 0.5 + 0.2,
        }));

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particlesRef.current.forEach((particle, i) => {
                // Mouse interaction
                const dx = mouseRef.current.x - particle.x;
                const dy = mouseRef.current.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.vx -= (dx / distance) * force * 0.02;
                    particle.vy -= (dy / distance) * force * 0.02;
                }

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Bounce off walls
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                // Keep in bounds
                particle.x = Math.max(0, Math.min(canvas.width, particle.x));
                particle.y = Math.max(0, Math.min(canvas.height, particle.y));

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                const opacityHex = Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
                ctx.fillStyle = particle.color + opacityHex;
                ctx.fill();

                // Draw connections
                particlesRef.current.slice(i + 1).forEach((otherParticle) => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        const lineOpacity = Math.floor((1 - distance / 120) * 50).toString(16).padStart(2, '0');
                        ctx.strokeStyle = particle.color + lineOpacity;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

export default function LandingPage() {
    const heroRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const featuresRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const howItWorksRef = useRef<HTMLDivElement>(null);
    const benefitsRef = useRef<HTMLDivElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    // Custom cursor effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            if (cursorRef.current) {
                gsap.to(cursorRef.current, {
                    x: e.clientX,
                    y: e.clientY,
                    duration: 0.3,
                    ease: 'power2.out',
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Hero title animation with stagger
            if (titleRef.current) {
                const words = titleRef.current.querySelectorAll('.word');
                gsap.fromTo(
                    words,
                    {
                        opacity: 0,
                        y: 100,
                        rotateX: 90,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 1.2,
                        stagger: 0.1,
                        ease: 'back.out(1.7)',
                    }
                );
            }

            if (subtitleRef.current) {
                gsap.fromTo(
                    subtitleRef.current,
                    {
                        opacity: 0,
                        y: 30,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        delay: 0.5,
                        ease: 'power3.out',
                    }
                );
            }

            if (ctaRef.current && ctaRef.current.children) {
                gsap.fromTo(
                    ctaRef.current.children,
                    {
                        opacity: 0,
                        scale: 0.8,
                        y: 30,
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.8,
                        delay: 0.8,
                        stagger: 0.15,
                        ease: 'back.out(1.7)',
                    }
                );
            }

            // Magnetic effect for buttons
            const buttons = document.querySelectorAll('.magnetic');
            buttons.forEach((button) => {
                const handleMouseMove = (e: any) => {
                    const rect = button.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    gsap.to(button, {
                        x: x * 0.3,
                        y: y * 0.3,
                        duration: 0.5,
                        ease: 'power2.out',
                    });
                };

                const handleMouseLeave = () => {
                    gsap.to(button, {
                        x: 0,
                        y: 0,
                        duration: 0.5,
                        ease: 'power2.out',
                    });
                };

                button.addEventListener('mousemove', handleMouseMove);
                button.addEventListener('mouseleave', handleMouseLeave);
            });

            // 3D tilt effect for feature cards
            const cards = document.querySelectorAll('.feature-card-3d');


            // Scroll Progress Indicator - FIXED
            if (progressBarRef.current) {
                gsap.to(progressBarRef.current, {
                    scaleX: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: 'body',
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: 0.3,
                        onUpdate: (self) => {
                            if (progressBarRef.current) {
                                progressBarRef.current.style.transform = `scaleX(${self.progress})`;
                            }
                        },
                    },
                });
            }

            // Advanced Parallax with different speeds - FIXED
            gsap.utils.toArray('.parallax-slow').forEach((element: any) => {
                const parent = element.parentElement || element;
                ScrollTrigger.create({
                    trigger: parent,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5,
                    onUpdate: (self) => {
                        gsap.set(element, {
                            yPercent: -50 * self.progress,
                        });
                    },
                });
            });

            gsap.utils.toArray('.parallax-fast').forEach((element: any) => {
                const parent = element.parentElement || element;
                ScrollTrigger.create({
                    trigger: parent,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.5,
                    onUpdate: (self) => {
                        gsap.set(element, {
                            yPercent: -100 * self.progress,
                        });
                    },
                });
            });

            // Scroll-based rotation - FIXED
            gsap.utils.toArray('.rotate-on-scroll').forEach((element: any) => {
                const parent = element.parentElement || element;
                ScrollTrigger.create({
                    trigger: parent,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                    onUpdate: (self) => {
                        gsap.set(element, {
                            rotation: 360 * self.progress,
                        });
                    },
                });
            });

            // Scroll-based scale - FIXED
            gsap.utils.toArray('.scale-on-scroll').forEach((element: any) => {
                ScrollTrigger.create({
                    trigger: element,
                    start: 'top bottom',
                    end: 'top 50%',
                    scrub: 1,
                    onEnter: () => {
                        gsap.fromTo(
                            element,
                            { scale: 0.8, opacity: 0 },
                            { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }
                        );
                    },
                });
            });

            // Scroll-triggered animations - FIXED
            gsap.utils.toArray('.reveal-up').forEach((element: any) => {
                ScrollTrigger.create({
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                    onEnter: () => {
                        gsap.fromTo(
                            element,
                            {
                                opacity: 0,
                                y: 100,
                                scale: 0.9,
                            },
                            {
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                duration: 1,
                                ease: 'power3.out',
                            }
                        );
                    },
                });
            });

            // Staggered scroll reveals - FIXED
            gsap.utils.toArray('.stagger-reveal').forEach((element: any) => {
                const children = Array.from(element.children) as HTMLElement[];
                ScrollTrigger.create({
                    trigger: element,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                    onEnter: () => {
                        gsap.from(children, {
                            opacity: 0,
                            y: 100,
                            rotation: -15,
                            duration: 1,
                            stagger: 0.15,
                            ease: 'back.out(1.7)',
                        });
                    },
                });
            });

            // Scroll-based blur effect - FIXED
            gsap.utils.toArray('.blur-on-scroll').forEach((element: any) => {
                // Set initial state
                gsap.set(element, {
                    filter: 'blur(10px)',
                    opacity: 0,
                });
                
                ScrollTrigger.create({
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                    onEnter: () => {
                        gsap.to(element, {
                            filter: 'blur(0px)',
                            opacity: 1,
                            duration: 1,
                            ease: 'power2.out',
                        });
                    },
                });
            });

            // Clip reveal - FIXED
            gsap.utils.toArray('.clip-reveal').forEach((element: any) => {
                ScrollTrigger.create({
                    trigger: element,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                    onEnter: () => {
                        gsap.fromTo(
                            element,
                            {
                                clipPath: 'polygon(0 0, 0 0, 0 100%, 0% 100%)',
                            },
                            {
                                clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                                duration: 1.5,
                                ease: 'power3.out',
                            }
                        );
                    },
                });
            });

            // Text reveal - FIXED
            gsap.utils.toArray('.text-reveal').forEach((element: any) => {
                const text = element.textContent || '';
                const words = text.split(' ');
                const wordSpans: HTMLSpanElement[] = [];

                // Only process if not already processed
                if (element.children.length === 0) {
                    element.innerHTML = '';
                    words.forEach((word: string, wordIndex: number) => {
                        const wordSpan = document.createElement('span');
                        wordSpan.style.display = 'inline-block';
                        wordSpan.style.overflow = 'hidden';
                        wordSpan.style.marginRight = '0.3em';
                        const letterSpan = document.createElement('span');
                        letterSpan.style.display = 'inline-block';
                        letterSpan.textContent = word;
                        letterSpan.style.transform = 'translateY(100%)';
                        letterSpan.style.opacity = '0';
                        wordSpan.appendChild(letterSpan);
                        element.appendChild(wordSpan);
                        wordSpans.push(letterSpan);
                    });
                } else {
                    // If already processed, get existing spans
                    const existingSpans = element.querySelectorAll('span > span');
                    wordSpans.push(...Array.from(existingSpans) as HTMLSpanElement[]);
                }

                ScrollTrigger.create({
                    trigger: element,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                    onEnter: () => {
                        wordSpans.forEach((span, index) => {
                            gsap.to(span, {
                                y: '0%',
                                opacity: 1,
                                duration: 0.8,
                                delay: index * 0.1,
                                ease: 'power3.out',
                            });
                        });
                    },
                });
            });

            // Number counter - FIXED
            const counters = document.querySelectorAll('.counter');
            counters.forEach((counter) => {
                const target = parseInt(counter.getAttribute('data-target') || '0');
                let animated = false;

                ScrollTrigger.create({
                    trigger: counter.closest('.stat-card') || counter,
                    start: 'top 80%',
                    onEnter: () => {
                        if (animated) return;
                        animated = true;
                        const duration = 2;
                        const increment = target / (duration * 60);
                        let current = 0;

                        const updateCounter = () => {
                            if (current < target) {
                                current += increment;
                                counter.textContent = Math.floor(current) + '%';
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.textContent = target + '%';
                            }
                        };
                        updateCounter();
                    },
                });
            });
        });

        // Wait for DOM to be fully ready and refresh ScrollTrigger
        setTimeout(() => {
            ScrollTrigger.refresh();
        }, 100);

        return () => {
            ctx.revert();
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
            // Clean up event listeners
            const buttons = document.querySelectorAll('.magnetic');
            buttons.forEach((button) => {
                button.removeEventListener('mousemove', () => {});
                button.removeEventListener('mouseleave', () => {});
            });
            const cards = document.querySelectorAll('.feature-card-3d');
            cards.forEach((card) => {
                card.removeEventListener('mousemove', () => {});
                card.removeEventListener('mouseleave', () => {});
            });
        };
    }, []);

    const features = [
        {
            icon: Wallet,
            title: 'Multiple Accounts',
            description: 'Create and manage multiple accounts (Cash, Bank, Credit) to organize your finances efficiently.',
            color: colors.primary,
            bgColor: `${colors.primary}15`,
        },
        {
            icon: TrendingUp,
            title: 'Track Transactions',
            description: 'Record expenses, income, and transfers with customizable tags and categories for complete financial visibility.',
            color: colors.secondary,
            bgColor: `${colors.secondary}15`,
        },
        {
            icon: BarChart3,
            title: 'Smart Analytics',
            description: 'Get detailed insights and analytics about your spending patterns with interactive charts and reports.',
            color: colors.info,
            bgColor: `${colors.info}15`,
        },
        {
            icon: Globe,
            title: 'Multi-Currency',
            description: 'Track finances across multiple currencies with real-time exchange rates and automatic conversions.',
            color: colors.accent,
            bgColor: `${colors.accent}15`,
        },
        {
            icon: PieChart,
            title: 'Budget Planning',
            description: 'Set budgets and track your progress towards financial goals with visual progress indicators.',
            color: colors.success,
            bgColor: `${colors.success}15`,
        },
        {
            icon: Shield,
            title: 'Secure & Private',
            description: 'Your financial data is encrypted and stored securely. Your privacy is our priority.',
            color: colors.warning,
            bgColor: `${colors.warning}15`,
        },
    ];

    const stats = [
        { icon: DollarSign, value: '100', label: 'Free to Use', color: colors.primary, target: 100 },
        { icon: Zap, value: 'Real-time', label: 'Updates', color: colors.secondary },
        { icon: Target, value: 'Easy', label: 'Goal Setting', color: colors.accent },
        { icon: CheckCircle2, value: 'Secure', label: 'Data Protection', color: colors.info },
    ];

    const steps = [
        {
            number: '01',
            title: 'Create Accounts',
            description: 'Set up your accounts in seconds - Cash, Bank, Credit, or custom types. Organize everything your way.',
            icon: Plus,
            color: colors.primary,
        },
        {
            number: '02',
            title: 'Add Transactions',
            description: 'Record expenses, income, and transfers with just a few clicks. Categorize with custom tags.',
            icon: ArrowLeftRight,
            color: colors.secondary,
        },
        {
            number: '03',
            title: 'Analyze & Grow',
            description: 'View insights, track trends, and make informed financial decisions with beautiful charts.',
            icon: TrendingUp,
            color: colors.accent,
        },
    ];

    const benefits = [
        {
            icon: Eye,
            title: 'Financial Clarity',
            description: 'See exactly where your money goes and identify spending patterns and opportunities to save.',
            color: colors.primary,
        },
        {
            icon: Clock,
            title: 'Time Savings',
            description: 'Quick transaction entry with automated calculations and summaries. Spend less time managing finances.',
            color: colors.secondary,
        },
        {
            icon: Target,
            title: 'Goal Achievement',
            description: 'Track progress toward financial goals and make data-driven decisions to achieve them faster.',
            color: colors.accent,
        },
        {
            icon: Globe,
            title: 'Multi-Currency Convenience',
            description: 'Manage finances across currencies with real-time exchange rate updates and automatic conversions.',
            color: colors.info,
        },
        {
            icon: Lock,
            title: 'Privacy & Control',
            description: 'Your data stays private and secure. No third-party sharing. You have complete control.',
            color: colors.success,
        },
        {
            icon: Sparkles,
            title: 'Smart Insights',
            description: 'Get AI-powered insights and recommendations to optimize your financial health and spending habits.',
            color: colors.warning,
        },
    ];

    const titleWords = ['Take Control of', 'Your Finances'];

    return (
        <div className="min-h-screen bg-black overflow-x-hidden relative">
            {/* Scroll Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 z-[10000] bg-black/20">
                <div
                    ref={progressBarRef}
                    className="h-full origin-left"
                    style={{
                        background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                        transform: 'scaleX(0)',
                    }}
                />
            </div>

            {/* Particle System */}
            <ParticleSystem />

            {/* Custom Cursor */}
            <div
                ref={cursorRef}
                className="fixed pointer-events-none z-[9999] mix-blend-difference hidden md:block"
                style={{
                    left: '-20px',
                    top: '-20px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'white',
                    transform: 'translate(-50%, -50%)',
                }}
            />

            {/* Hero Section */}
            <section
                ref={heroRef}
                className="relative min-h-screen flex items-center justify-center px-4 lg:px-12 py-20 overflow-hidden"
                style={{ background: 'radial-gradient(ellipse at top, #1a1a2e, #000000)' }}
            >
                {/* Animated gradient orbs with parallax */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="parallax-slow absolute top-20 left-10 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 floating-orb"
                        style={{
                            background: `radial-gradient(circle, ${colors.primary}60, transparent 70%)`,
                        }}
                    />
                    <div
                        className="parallax-fast absolute bottom-20 right-10 w-[700px] h-[700px] rounded-full blur-3xl opacity-30 floating-orb"
                        style={{
                            background: `radial-gradient(circle, ${colors.secondary}60, transparent 70%)`,
                        }}
                    />
                    <div
                        className="parallax-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl opacity-20 floating-orb"
                        style={{
                            background: `radial-gradient(circle, ${colors.accent}50, transparent 70%)`,
                        }}
                    />
                </div>

                <div className="relative z-10 max-w-6xl mx-auto text-center">
                    <h1
                        ref={titleRef}
                        className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight"
                    >
                        {titleWords.map((word, i) => (
                            <span key={i} className="word inline-block mr-4">
                                <span
                                    className="inline-block"
                                    style={{
                                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary}, ${colors.accent})`,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    {word}
                                </span>
                            </span>
                        ))}
                    </h1>
                    <p
                        ref={subtitleRef}
                        className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-gray-300 font-light"
                    >
                        The ultimate money tracking solution to manage accounts, track transactions,
                        analyze spending, and achieve your financial goals with ease.
                    </p>
                    <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link
                            href="/dashboard"
                            className="magnetic group relative px-10 py-7 rounded-full font-bold text-lg text-white overflow-hidden cursor-pointer"
                            style={{
                                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                            }}
                        >
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
                            className="magnetic px-10 py-7 rounded-full font-bold text-lg border-2 transition-all duration-300 cursor-pointer backdrop-blur-sm bg-white/5 hover:bg-white/10"
                            style={{
                                borderColor: colors.primary,
                                color: 'white',
                            }}
                        >
                            View Demo
                        </Link>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-white/50 text-sm font-light">Scroll</span>
                        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center p-2">
                            <div
                                className="w-1 h-3 rounded-full animate-bounce"
                                style={{ backgroundColor: colors.primary }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - ENSURED VISIBLE */}
            <section
                ref={featuresRef}
                className="py-32 px-4 lg:px-12 relative min-h-screen flex items-center"
                style={{ background: 'linear-gradient(to bottom, #000000, #0a0a0a)' }}
            >
                <div className="max-w-7xl mx-auto w-full">
                    <div className="text-center mb-20 reveal-up">
                        <h2 className="text-5xl md:text-6xl font-black mb-6 text-white text-reveal">
                            Everything You Need
                        </h2>
                        <p className="text-xl max-w-2xl mx-auto text-gray-400 font-light blur-on-scroll" style={{ filter: 'blur(10px)', opacity: 0 }}>
                            Powerful features designed to help you manage your money effectively
                        </p>
                    </div>

                    <div className="stagger-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="feature-card-3d scale-on-scroll group relative rounded-3xl p-8 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 overflow-hidden"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                                        style={{
                                            background: `radial-gradient(circle, ${feature.color}40, transparent 70%)`,
                                        }}
                                    />
                                    <div className="relative z-10">
                                        <div
                                            className="rotate-on-scroll w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                                            style={{
                                                background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                                                border: `1px solid ${feature.color}30`,
                                            }}
                                        >
                                            <Icon className="w-10 h-10" style={{ color: feature.color }} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
                                        <p className="leading-relaxed text-gray-400">{feature.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works Section - ENSURED VISIBLE */}
            <section
                ref={howItWorksRef}
                className="py-32 px-4 lg:px-12 relative min-h-screen flex items-center overflow-hidden"
                style={{ background: '#0a0a0a' }}
            >
                <div className="max-w-6xl mx-auto w-full">
                    <div className="text-center mb-20 reveal-up">
                        <h2 className="text-5xl md:text-6xl font-black mb-6 text-white text-reveal">
                            How It Works
                        </h2>
                        <p className="text-xl max-w-2xl mx-auto text-gray-400 font-light blur-on-scroll" style={{ filter: 'blur(10px)', opacity: 0 }}>
                            Get started in three simple steps
                        </p>
                    </div>

                    <div className="stagger-reveal grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={index}
                                    className="scale-on-scroll relative"
                                >
                                    <div className="text-center">
                                        <div
                                            className="scale-on-scroll w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl font-black text-white shadow-2xl relative"
                                            style={{
                                                background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                                            }}
                                        >
                                            <span className="relative z-10">{step.number}</span>
                                            <div
                                                className="absolute inset-0 rounded-full animate-ping opacity-20"
                                                style={{ backgroundColor: step.color }}
                                            />
                                        </div>
                                        <div
                                            className="rotate-on-scroll w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center transform transition-transform hover:scale-110 hover:rotate-12"
                                            style={{
                                                background: `${step.color}20`,
                                                border: `2px solid ${step.color}40`,
                                            }}
                                        >
                                            <Icon className="w-10 h-10" style={{ color: step.color }} />
                                        </div>
                                        <h3 className="text-3xl font-bold mb-4 text-white">{step.title}</h3>
                                        <p className="leading-relaxed text-gray-400">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section - ENSURED VISIBLE */}
            <section
                ref={benefitsRef}
                className="py-32 px-4 lg:px-12 relative min-h-screen flex items-center"
                style={{ background: 'linear-gradient(to bottom, #0a0a0a, #000000)' }}
            >
                <div className="max-w-6xl mx-auto w-full">
                    <div className="text-center mb-20 reveal-up">
                        <h2 className="text-5xl md:text-6xl font-black mb-6 text-white text-reveal">
                            Why Choose Money Tracker?
                        </h2>
                        <p className="text-xl max-w-2xl mx-auto text-gray-400 font-light blur-on-scroll" style={{ filter: 'blur(10px)', opacity: 0 }}>
                            Experience the benefits of smart financial management
                        </p>
                    </div>

                    <div className="stagger-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <div
                                    key={index}
                                    className="scale-on-scroll benefit-item bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105"
                                >
                                    <div
                                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                                        style={{ backgroundColor: `${benefit.color}20`, border: `1px solid ${benefit.color}40` }}
                                    >
                                        <Icon className="w-7 h-7" style={{ color: benefit.color }} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white">{benefit.title}</h3>
                                    <p className="leading-relaxed text-gray-400">{benefit.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Stats Section - ENSURED VISIBLE */}
            <section
                ref={statsRef}
                className="py-32 px-4 lg:px-12 relative min-h-screen flex items-center"
                style={{ background: '#000000' }}
            >
                <div className="max-w-6xl mx-auto w-full">
                    <div className="stagger-reveal grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={index}
                                    className="stat-card scale-on-scroll text-center p-8 rounded-3xl backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 clip-reveal"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                    }}
                                >
                                    <div className="flex justify-center mb-6">
                                        <div
                                            className="rotate-on-scroll w-20 h-20 rounded-full flex items-center justify-center"
                                            style={{
                                                background: `${stat.color}20`,
                                                border: `2px solid ${stat.color}40`,
                                            }}
                                        >
                                            <Icon className="w-10 h-10" style={{ color: stat.color }} />
                                        </div>
                                    </div>
                                    <div className="text-4xl md:text-5xl font-black mb-3 text-white" style={{ color: stat.color }}>
                                        {stat.target ? (
                                            <span className="counter" data-target={stat.target}>{stat.value}</span>
                                        ) : (
                                            stat.value
                                        )}
                                    </div>
                                    <div className="font-medium text-gray-400">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-4 lg:px-12 relative overflow-hidden min-h-screen flex items-center">
                <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
                    <div
                        className="relative rounded-3xl p-12 md:p-20 border border-white/20 overflow-hidden backdrop-blur-xl"
                        style={{
                            background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
                        }}
                    >
                        <div
                            className="absolute inset-0 opacity-50"
                            style={{
                                background: `radial-gradient(circle at 50% 50%, ${colors.primary}40, transparent 70%)`,
                                animation: 'pulse 4s ease-in-out infinite',
                            }}
                        />
                        <div className="relative z-10">
                            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
                                Ready to Transform Your Finances?
                            </h2>
                            <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-300 font-light">
                                Join thousands of users who are already taking control of their money.
                                Start tracking today!
                            </p>
                            <Link
                                href="/dashboard"
                                className="magnetic inline-flex items-center px-10 py-7 rounded-full font-bold text-lg bg-white text-gray-900 hover:bg-gray-100 shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                            >
                                Start Tracking Now
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer
                className="py-16 px-4 lg:px-12 border-t border-white/10"
                style={{ background: '#000000' }}
            >
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                        <div className="mb-4 md:mb-0 text-center md:text-left">
                            <h3 className="text-2xl font-black mb-2 text-white">Money Tracker</h3>
                            <p className="text-gray-400">Your personal finance management solution</p>
                        </div>
                        <div className="flex gap-8 flex-wrap justify-center">
                            {['Dashboard', 'Transactions', 'Reports', 'Accounts', 'Budget'].map((link) => (
                                <Link
                                    key={link}
                                    href={`/${link.toLowerCase()}`}
                                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    {link}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Money Tracker. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                    }
                    50% {
                        transform: translateY(-50px) translateX(50px);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.5;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.1);
                    }
                }

                .floating-orb {
                    animation: float 20s ease-in-out infinite;
                }

                html {
                    scroll-behavior: smooth;
                }

                body {
                    overflow-x: hidden;
                }
            `}</style>
        </div>
    );
}
