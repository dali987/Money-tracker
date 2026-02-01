const SkeletonNetWorth = () => (
    <div className="w-full font-mono bg-base-100 rounded-box p-4">
        <div className="flex justify-between items-center mb-6">
            <div className="skeleton h-8 w-40"></div>
            <div className="skeleton h-8 w-32"></div>
        </div>
        {[1, 2].map((i) => (
            <div key={i} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <div className="skeleton h-6 w-24"></div>
                    <div className="skeleton h-6 w-28"></div>
                </div>
                <div className="space-y-2 ml-4">
                    <div className="skeleton h-10 w-full"></div>
                    <div className="skeleton h-10 w-full"></div>
                </div>
            </div>
        ))}
    </div>
);

export default SkeletonNetWorth;