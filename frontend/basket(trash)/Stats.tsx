import { stats } from '@/app/Constants';

const Stats = () => {
    return (
        <section
            className="py-32 px-4 lg:px-12 relative min-h-screen flex items-center"
            style={{ background: '#000000' }}>
            <div className="max-w-6xl mx-auto w-full">
                <div className="stagger-reveal grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="card scale-on-scroll text-center p-8 rounded-3xl backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 clip-reveal"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                }}>
                                <div className="flex justify-center mb-6">
                                    <div
                                        className="w-20 h-20 rounded-full flex items-center justify-center"
                                        style={{
                                            background: `${stat.color}20`,
                                            border: `2px solid ${stat.color}40`,
                                        }}>
                                        <Icon className="w-10 h-10" style={{ color: stat.color }} />
                                    </div>
                                </div>
                                <div
                                    className="text-4xl md:text-5xl font-black mb-3 text-white"
                                    style={{ color: stat.color }}>
                                    {stat.target ? (
                                        <span className="counter" data-target={stat.target}>
                                            {stat.value}
                                        </span>
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
    );
};

export default Stats;
