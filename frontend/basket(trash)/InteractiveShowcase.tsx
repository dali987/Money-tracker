'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useRef, useEffect } from 'react';
import ShowcaseHero from './InteractiveShowcase/ShowcaseHero';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

const InteractiveShowcase = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!sectionRef.current || !containerRef.current) return;

            // Main timeline for the entire section
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    end: 'bottom 30%',
                    scrub: 1,
                    // markers: true, // Uncomment for debugging
                },
            });

            // Section entrance animation
            tl.fromTo(
                sectionRef.current,
                {
                    opacity: 0,
                    y: 100,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                }
            );

            // Create individual scroll triggers for sub-sections
            const subsections = containerRef.current.querySelectorAll('.showcase-subsection');
            
            subsections.forEach((section, index) => {
                gsap.fromTo(
                    section,
                    {
                        opacity: 0,
                        y: 50,
                        scale: 0.95,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: section,
                            start: 'top 85%',
                            end: 'bottom 15%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            });

            // Cleanup
            return () => {
                ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            };
        },
        { scope: sectionRef }
    );

    return (
        <section
            ref={sectionRef}
            className="relative py-24 lg:py-48 bg-linear-to-b from-gray-950 via-gray-900 to-gray-900/50 overflow-hidden">
            

            {/* Content Container */}
            <div ref={containerRef} className="relative max-w-7xl mx-auto px-6 md:px-12">
                
                {/* Section Header */}
                <div className="text-center mb-16 lg:mb-24 showcase-subsection">
                    <div className="flex items-center justify-center gap-4 mb-6 lg:mb-8">
                        <div className="w-8 lg:w-12 h-0.5 bg-linear-to-r from-indigo-500 to-blue-400" />
                        <span className="text-sm lg:text-xl font-black tracking-[0.4em] lg:tracking-[0.6em] uppercase text-indigo-500 text-nowrap">
                            Premium Features
                        </span>
                        <div className="w-8 lg:w-12 h-0.5 bg-linear-to-r from-blue-400 to-indigo-500" />
                    </div>
                    
                    <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-[9rem] font-black text-white tracking-tighter uppercase italic leading-[0.8] mb-8">
                        Experience{' '}
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-500 via-blue-400 to-purple-500">
                            Excellence
                        </span>
                    </h2>
                    
                    <p className="text-lg lg:text-3xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
                        Where intelligent design meets powerful functionality to transform your financial journey
                    </p>
                </div>

                {/* Showcase Component */}
                <div className="showcase-subsection">
                    <ShowcaseHero />
                </div>
            </div>
        </section>
    );
};

export default InteractiveShowcase;
