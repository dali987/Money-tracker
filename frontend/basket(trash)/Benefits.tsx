import { benefits } from '@/app/Constants';

const Benefits = () => {
    return (
        <section
            className="py-32 px-4 lg:px-12 relative min-h-screen flex items-center"
            style={{ background: 'linear-gradient(to bottom, #0a0a0a, #000000)' }}>
            <div className="max-w-6xl mx-auto w-full">
                <div className="text-center mb-20 reveal-up">
                    <h2 className="text-5xl md:text-6xl font-black mb-6 text-white text-reveal">
                        Why Choose Money Tracker?
                    </h2>
                    <p
                        className="text-xl max-w-2xl mx-auto text-gray-400 font-light blur-on-scroll"
                        style={{ filter: 'blur(10px)', opacity: 0 }}>
                        Experience the benefits of smart financial management
                    </p>
                </div>

                <div className="stagger-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <div key={index} className="3d-tilt">
                                <div className="card scale-on-scroll benefit-item bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                                    <div className="card-body">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                                            style={{
                                                background: `linear-gradient(135deg, ${benefit.color}20, ${benefit.color}10)`,
                                                border: `1px solid ${benefit.color}30`,
                                            }}>
                                            <Icon
                                                className="w-10 h-10"
                                                style={{ color: benefit.color }}
                                            />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-white">
                                            {benefit.title}
                                        </h3>
                                        <p className="leading-relaxed text-gray-400">
                                            {benefit.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Benefits;
