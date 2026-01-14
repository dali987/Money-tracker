'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState, useEffect } from 'react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Star, 
    Quote,
    CheckCircle
} from 'lucide-react';
import { colors } from '@/app/Constants';

const TestimonialCarousel = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const testimonialsRef = useRef<(HTMLDivElement | null)[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Freelance Designer",
            content: "This app has completely transformed how I manage my finances. The multi-currency support is perfect for my international clients, and the analytics help me make smarter business decisions.",
            rating: 5,
            avatar: "SJ",
            color: colors.primary,
            featured: true,
        },
        {
            name: "Michael Chen",
            role: "Software Engineer",
            content: "Finally, a financial app that gets it. Clean interface, powerful features, and the security I need for my sensitive data. The budget planning tools have helped me save 30% more this year.",
            rating: 5,
            avatar: "MC",
            color: colors.secondary,
            featured: false,
        },
        {
            name: "Emily Rodriguez",
            role: "Marketing Manager",
            content: "The real-time updates and smart insights are game-changers. I can track my spending patterns and adjust my budget on the fly. It's like having a financial advisor in my pocket.",
            rating: 5,
            avatar: "ER",
            color: colors.accent,
            featured: false,
        },
        {
            name: "David Kim",
            role: "Small Business Owner",
            content: "Managing business and personal finances used to be a nightmare. Now everything is in one place with clear separation. The account transfer feature saves me hours every month.",
            rating: 5,
            avatar: "DK",
            color: colors.info,
            featured: false,
        },
        {
            name: "Lisa Thompson",
            role: "Consultant",
            content: "The AI-powered insights have helped me identify spending patterns I never noticed. The goal tracking feature keeps me motivated to achieve my financial objectives.",
            rating: 5,
            avatar: "LT",
            color: colors.success,
            featured: false,
        },
    ];

    useGSAP(
        () => {
            if (!containerRef.current || !carouselRef.current) return;

            // Initial animation for testimonials
            testimonialsRef.current.forEach((testimonial, index) => {
                if (!testimonial) return;
                
                gsap.fromTo(
                    testimonial,
                    {
                        opacity: 0,
                        x: index === 0 ? 0 : 100,
                        scale: index === 0 ? 1 : 0.8,
                    },
                    {
                        opacity: index === 0 ? 1 : 0.3,
                        x: 0,
                        scale: index === 0 ? 1 : 0.8,
                        duration: 0.8,
                        delay: index * 0.1,
                        ease: "power2.out",
                    }
                );
            });
        },
        { scope: containerRef }
    );

    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            handleNext();
        }, 5000);

        return () => clearInterval(interval);
    }, [currentIndex, isAutoPlaying]);

    const handleNext = () => {
        const nextIndex = (currentIndex + 1) % testimonials.length;
        navigateToTestimonial(nextIndex);
    };

    const handlePrevious = () => {
        const prevIndex = currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1;
        navigateToTestimonial(prevIndex);
    };

    const navigateToTestimonial = (index: number) => {
        // Animate out current testimonial
        testimonialsRef.current.forEach((testimonial, i) => {
            if (!testimonial) return;
            
            const isActive = i === currentIndex;
            const willBeActive = i === index;
            
            gsap.to(testimonial, {
                opacity: willBeActive ? 1 : 0.3,
                scale: willBeActive ? 1 : 0.8,
                x: willBeActive ? 0 : (i < index ? -100 : 100),
                duration: 0.5,
                ease: "power2.inOut",
            });
        });

        setCurrentIndex(index);
    };

    const handleDotClick = (index: number) => {
        setIsAutoPlaying(false);
        navigateToTestimonial(index);
    };

    const handleMouseEnter = () => setIsAutoPlaying(false);
    const handleMouseLeave = () => setIsAutoPlaying(true);

    return (
        <div 
            ref={containerRef} 
            className="py-16 lg:py-24"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Section Header */}
            <div className="text-center mb-16 lg:mb-20">
                <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6">
                    What Our{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-400">
                        Users Say
                    </span>
                </h3>
                <p className="text-lg lg:text-2xl text-gray-400 max-w-3xl mx-auto">
                    Join thousands of satisfied users who have transformed their financial lives
                </p>
            </div>

            {/* Carousel Container */}
            <div className="relative max-w-6xl mx-auto">
                <div 
                    ref={carouselRef}
                    className="relative overflow-hidden"
                    style={{ height: "400px" }}
                >
                    {/* Testimonials */}
                    <div className="relative h-full">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                ref={(el) => {
                                    testimonialsRef.current[index] = el;
                                }}
                                className={`absolute inset-0 flex items-center justify-center px-6 lg:px-12 ${
                                    index === 0 ? 'opacity-100 scale-100' : 'opacity-30 scale-80'
                                }`}
                                style={{
                                    transform: `translateX(${(index - currentIndex) * 100}%)`,
                                    transition: 'none', // GSAP handles transitions
                                }}
                            >
                                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl border border-white/20 p-8 lg:p-12 max-w-4xl w-full shadow-2xl">
                                    {/* Quote Icon */}
                                    <div className="mb-6">
                                        <Quote className="w-12 h-12 text-indigo-500 opacity-50" />
                                    </div>

                                    {/* Content */}
                                    <blockquote className="text-xl lg:text-3xl text-white mb-8 leading-relaxed font-medium">
                                        "{testimonial.content}"
                                    </blockquote>

                                    {/* Rating */}
                                    <div className="flex gap-1 mb-8">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
                                        ))}
                                    </div>

                                    {/* Author */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div 
                                                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                                                style={{ backgroundColor: testimonial.color }}
                                            >
                                                {testimonial.avatar}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-bold text-white">{testimonial.name}</h4>
                                                <p className="text-gray-400">{testimonial.role}</p>
                                            </div>
                                        </div>

                                        {testimonial.featured && (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full">
                                                <CheckCircle className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm text-yellow-500 font-medium">Featured</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between mt-12">
                    {/* Previous Button */}
                    <button
                        onClick={handlePrevious}
                        className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="flex gap-2">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleDotClick(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    index === currentIndex 
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 w-8' 
                                        : 'bg-white/30 hover:bg-white/50'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={handleNext}
                        className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors duration-300"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Auto-play Indicator */}
                <div className="text-center mt-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full">
                        <div className={`w-2 h-2 rounded-full ${isAutoPlaying ? 'bg-green-500' : 'bg-gray-500'}`} />
                        <span className="text-sm text-gray-400">
                            {isAutoPlaying ? 'Auto-playing' : 'Paused'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Background Decorations */}
            <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-pink-500/10 blur-3xl" />
        </div>
    );
};

export default TestimonialCarousel;
