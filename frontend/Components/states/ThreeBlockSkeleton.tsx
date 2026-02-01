import { motion } from 'motion/react';

const ThreeBlockSkeleton = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20}}
            animate={{ opacity: 1, y: 0}}
            transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className="skeleton h-56 rounded-2xl w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                />
            ))}
        </motion.div>
    );
};

export default ThreeBlockSkeleton;
