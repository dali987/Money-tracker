import { steps } from '@/app/Constants';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useRef } from 'react';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const Steps = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const indicatorColRef = useRef<HTMLDivElement>(null);
    const indicatorFillRef = useRef<HTMLDivElement>(null);
    const stepsContentRefs = useRef<(HTMLDivElement | null)[]>([]);

    useGSAP(
        () => {
            if (!sectionRef.current || !indicatorColRef.current || !indicatorFillRef.current)
                return;

            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 10%',
                end: 'bottom 120%',
                pin: indicatorColRef.current,
                pinSpacing: false,
            });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top 50%',
                    end: 'bottom 80%',
                    scrub: 1,
                },
            });

            tl.to(indicatorFillRef.current, {
                clipPath: 'inset(0% 0% 0% 0%)',
                ease: 'none',
            });

            stepsContentRefs.current.forEach((section) => {
                if (!section) return;

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 95%',
                        end: 'bottom 5%',
                        scrub: 0.5,
                    },
                });

                tl.fromTo(
                    section,
                    {
                        opacity: 0,
                        y: 80,
                        rotateX: -10,
                        scale: 0.9,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        scale: 1,
                        ease: 'power3.out',
                        duration: 0.4,
                    }
                )
                    .to(section, {
                        opacity: 1,
                        duration: 0.2,
                    })
                    .to(section, {
                        opacity: 0,
                        y: -80,
                        rotateX: 10,
                        scale: 0.9,
                        ease: 'power3.in',
                        duration: 0.4,
                    });
            });
        },
        { scope: sectionRef }
    );

    return (
        <section
            ref={sectionRef}
            className="relative pt-24 lg:pt-48 bg-transparent overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex justify-center mb-24 lg:mb-40">
                    <div className="flex flex-col text-center items-center">
                        <div className="flex items-center gap-4 mb-6 lg:mb-8">
                            <div className="w-8 lg:w-12 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                            <span className="text-sm lg:text-lg font-black tracking-[0.4em] lg:tracking-[0.6em] uppercase text-indigo-400 text-nowrap drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                How it works
                            </span>
                            <div className="w-8 lg:w-12 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                        </div>
                        <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase leading-[0.8] mb-12 mix-blend-overlay opacity-50">
                            The{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-white to-indigo-400 pr-4 animate-pulse">
                                Process
                            </span>
                        </h2>
                    </div>
                </div>

                <div ref={containerRef} className="relative flex gap-8 lg:gap-24 items-start">
                    {/* Left Column: Progress Indicator */}
                    <div
                        ref={indicatorColRef}
                        className="min-w-10 lg:w-28 flex flex-col items-center">
                        <div className="relative w-full flex flex-col items-center h-125 lg:h-150">
                            {/* Base Line */}
                            <div className="absolute inset-y-0 w-1 bg-white/5 rounded-full" />

                            {/* Active Fill Layer (Indigo) with Glow */}
                            <div
                                ref={indicatorFillRef}
                                className="indicator-fill absolute inset-0 flex flex-col items-center pointer-events-none overflow-hidden"
                                style={{ clipPath: 'inset(0% 0% 100% 0%)' }}>
                                <div className="w-1 lg:w-1.5 h-full bg-indigo-500 rounded-full shadow-[0_0_20px_4px_rgba(99,102,241,0.6)]" />

                                {steps.map((step, index) => {
                                    const topPos =
                                        index === 0 ? '0%' : index === 1 ? '50%' : '100%';
                                    const translate =
                                        index === 0 ? '0%' : index === 1 ? '-50%' : '-100%';
                                    return (
                                        <div
                                            key={`fill-circle-${index}`}
                                            className="absolute left-1/2  w-12 h-12 lg:w-24 lg:h-24 rounded-full bg-indigo-500 flex items-center justify-center border-4 lg:border-8 border-black shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                                            style={{
                                                top: topPos,
                                                transform: `translate(-50%, ${translate})`,
                                            }}>
                                            <span className="text-xl lg:text-4xl font-black text-white">
                                                {index + 1}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-[40vh] lg:gap-[60vh] pb-[40vh]">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={`step-content-${index}`}
                                    ref={(el) => {
                                        stepsContentRefs.current[index] = el;
                                    }}
                                    className="flex flex-col justify-center min-h-[30vh] lg:min-h-[50vh] perspective-1000 pl-4 lg:pl-0">
                                    <div
                                        className="h-16 w-16 lg:w-24 lg:h-24 rounded-2xl mb-8 lg:mb-12 flex items-center justify-center bg-transparent border border-white/20 relative group hover:border-indigo-500/50 transition-colors duration-500"
                                        style={{ backdropFilter: 'blur(0px)' }}>
                                        <Icon
                                            className="w-8 h-8 lg:w-12 lg:h-12 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                                            style={{ color: step.color }}
                                        />
                                        <div
                                            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                            style={{
                                                boxShadow: `inset 0 0 20px ${step.color}20, 0 0 20px ${step.color}20`,
                                            }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-6 lg:gap-8 mb-6 lg:mb-8">
                                        <span
                                            className="text-sm lg:text-lg font-black tracking-[0.4em] lg:tracking-[0.6em] uppercase"
                                            style={{
                                                color: step.color,
                                                textShadow: `0 0 10px ${step.color}40`,
                                            }}>
                                            Phase {step.number}
                                        </span>
                                        <div className="h-px lg:h-0.5 w-20 bg-linear-to-r from-white/20 to-transparent" />
                                    </div>

                                    <h3 className="text-4xl lg:text-7xl font-black mb-8 lg:mb-10 text-white leading-[0.9] uppercase tracking-tight">
                                        {step.title}
                                    </h3>
                                    <p className="text-lg lg:text-2xl leading-relaxed text-gray-400 font-light max-w-full lg:max-w-4xl mb-12">
                                        {step.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Premium Decorative Strokes */}
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-indigo-500/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-blue-500/20 to-transparent" />
        </section>
    );
};

export default Steps;
