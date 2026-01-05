import React from 'react';

const TranscationsSkeleton = () => {
    return (
        <div className="flex items-center justify-between ">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex flex-col items-start gap-2">
                    <div className="skeleton h-8 w-46"></div>
                    <div className="skeleton h-5 w-16"></div>
                </div>
                <div className="flex flex-col lg:flex-row gap-2">
                    <div className="skeleton h-6 w-25"></div>
                    <div className="skeleton h-6 w-20"></div>
                </div>
            </div>
            <div className="skeleton w-20 h-6"></div>
        </div>
    );
};

export default TranscationsSkeleton;
