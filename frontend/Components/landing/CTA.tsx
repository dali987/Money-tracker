import { colors } from '@/app/Constants';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CTA = () => {
    return (
        <section className="py-32 px-4 lg:px-12 relative overflow-hidden min-h-screen flex items-center">
            <div className="max-w-4xl mx-auto text-center relative z-10 w-full">
                <div
                    className="relative rounded-3xl p-12 md:p-20 border border-white/20 overflow-hidden backdrop-blur-xl"
                    style={{
                        background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
                    }}>
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
                            className="magnetic inline-flex items-center px-10 py-7 rounded-full font-bold text-lg bg-white text-gray-900 hover:bg-gray-100 shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                            Start Tracking Now
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
