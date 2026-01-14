import { steps } from '@/app/Constants';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useRef } from 'react';

// Register ScrollTrigger
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

            // 1. Pin the indicator column while scrolling through the content
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: 'top 10%',
                end: 'bottom 120%',
                pin: indicatorColRef.current,
                pinSpacing: false,
                // markers: true,
            });

            // 2. Timeline for the indicator fill progress
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

            // 3. Animate each content section with a single timeline for smooth entry/exit
            stepsContentRefs.current.forEach((section, index) => {
                if (!section) return;

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 95%',
                        end: 'bottom 5%',
                        scrub: 0.5, // Smoother scrub
                    },
                });

                // Sequence: Fade In -> Hold -> Fade Out
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
                        duration: 0.4, // First 40% of the scroll range
                    }
                )
                    .to(section, {
                        opacity: 1,
                        duration: 0.2, // Hold for 20% in the middle
                    })
                    .to(section, {
                        opacity: 0,
                        y: -80,
                        rotateX: 10,
                        scale: 0.9,
                        ease: 'power3.in',
                        duration: 0.4, // Last 40% of the scroll range
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
                {/* Section Header */}
                <div className="flex items-center mb-24 lg:mb-40">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-4 mb-6 lg:mb-8">
                            <div className="w-8 lg:w-12 h-[2px] bg-indigo-500" />
                            <span className="text-sm lg:text-xl font-black tracking-[0.4em] lg:tracking-[0.6em] uppercase text-indigo-500 text-nowrap">
                                How it works
                            </span>
                        </div>
                        <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[9rem] font-black text-white tracking-tighter uppercase italic leading-[0.8] mb-12">
                            The{' '}
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 to-blue-400 pr-4">
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
                        <div className="relative w-full flex flex-col items-center h-[500px] lg:h-[700px]">
                            {/* Active Fill Layer (Indigo) */}
                            <div
                                ref={indicatorFillRef}
                                className="indicator-fill absolute inset-0 flex flex-col items-center pointer-events-none overflow-hidden"
                                style={{ clipPath: 'inset(0% 0% 100% 0%)' }}>
                                <div className="w-2.5 lg:w-4 h-full bg-indigo-500 rounded-full" />
                                {steps.map((step, index) => {
                                    const topPos =
                                        index === 0 ? '0%' : index === 1 ? '50%' : '100%';
                                    const translate =
                                        index === 0 ? '0%' : index === 1 ? '-50%' : '-100%';
                                    return (
                                        <div
                                            key={`fill-circle-${index}`}
                                            className="absolute left-1/2  w-12 h-12 lg:w-24 lg:h-24 rounded-full bg-indigo-500 flex items-center justify-center border-4 lg:border-8 border-black"
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

                    {/* Right Column: Scrollable Content */}
                    <div className="flex-1 flex flex-col gap-[40vh] lg:gap-[60vh] pb-[40vh]">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div
                                    key={`step-content-${index}`}
                                    ref={(el) => {
                                        stepsContentRefs.current[index] = el;
                                    }}
                                    className="flex flex-col justify-center min-h-[30vh] lg:min-h-[50vh] perspective-1000">
                                    <div
                                        className="h-14 w-14 lg:w-28 lg:h-28 rounded-xl lg:rounded-2xl mb-12 lg:mb-16 flex items-center justify-center bg-white/5 border border-white/10 relative group hover:border-indigo-500/50 transition-colors duration-500"
                                        style={{ backdropFilter: 'blur(20px)' }}>
                                        <Icon
                                            className="w-8 h-8 lg:w-14 lg:h-14 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
                                            style={{ color: step.color }}
                                        />
                                        <div
                                            className="absolute inset-0 rounded-full blur-2xl lg:blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-1000"
                                            style={{ backgroundColor: step.color }}
                                        />
                                    </div>

                                    <div className="flex items-center gap-6 lg:gap-8 mb-8 lg:mb-10">
                                        <span
                                            className="text-sm lg:text-2xl font-black tracking-[0.4em] lg:tracking-[0.6em] uppercase"
                                            style={{ color: step.color }}>
                                            Phase {step.number}
                                        </span>
                                        <div className="h-px lg:h-[2px] flex-1 bg-linear-to-r from-white/20 to-transparent" />
                                    </div>

                                    <h3 className="text-3xl lg:text-8xl font-black mb-10 lg:mb-12 text-white leading-[0.85] tracking-tighter uppercase italic">
                                        {step.title}
                                    </h3>
                                    <p className="text-lg lg:text-4xl leading-snug text-gray-500 font-medium max-w-full lg:max-w-4xl mb-12 lg:mb-16">
                                        {step.description}
                                    </p>

                                    <div className="flex items-center gap-4 lg:gap-6 group cursor-pointer w-fit">
                                        <div className="w-10 lg:w-14 h-[2px] bg-indigo-500 group-hover:w-20 lg:group-hover:w-24 transition-all duration-700" />
                                        <span className="text-sm lg:text-lg font-black tracking-widest uppercase text-white/40 group-hover:text-white transition-colors duration-500">
                                            Explore Phase
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Premium Decorative Strokes */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
        </section>
    );
};

export default Steps;
