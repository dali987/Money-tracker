'use client';

const ReportSkeleton = () => {
    return (
        <div className="w-full h-80 flex flex-col gap-6 p-4">
            <div className="flex-1 flex items-end justify-between gap-3 lg:gap-6 px-2">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className={`skeleton w-full rounded-lg opacity-80 ${i >= 3 ? 'hidden sm:block' : ''}`}
                        style={{
                            minWidth: '8px',
                            height: `${20 + (Math.sin(i * 0.5) + 1) * 30}%`,
                        }}
                    />
                ))}
            </div>

            <div className="flex justify-between px-2">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className={`skeleton h-3 w-10 lg:w-16 rounded-full ${i >= 3 ? 'hidden sm:block' : ''}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ReportSkeleton;
