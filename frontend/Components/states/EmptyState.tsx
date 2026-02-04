'use client';

import { motion } from 'motion/react';
import { Inbox, Plus } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
    };
}

const EmptyState = ({
    title = 'No transactions found',
    description = "We couldn't find any transactions for the selected filters. Try adjusting your search or add a new transaction to get started.",
    icon,
    action,
}: EmptyStateProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center py-20 px-6 text-center bg-base-100/50 rounded-3xl border border-dashed border-base-300">
            <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{
                    scale: 1,
                    rotate: 0,
                    y: [0, -12, 0],
                }}
                transition={{
                    scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                    rotate: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                    y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    },
                }}
                className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />

                <div className="relative p-8 rounded-3xl bg-linear-to-br from-base-200 to-base-300 border border-base-content/5 shadow-2xl overflow-hidden group">
                    <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_50%,transparent_75%)] bg-size-[20px_20px] animate-slide" />

                    {icon || (
                        <Inbox
                            size={56}
                            className="text-base-content/20 group-hover:text-primary/40 transition-colors duration-500"
                            strokeWidth={1.5}
                        />
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ delay: 0.2, duration: 0.5 }}>
                <h3 className="text-2xl font-bold text-base-content mb-3 tracking-tight">
                    {title}
                </h3>
                <p className="text-base-content/50 max-w-sm mx-auto leading-relaxed mb-8">
                    {description}
                </p>
            </motion.div>

            {action && (
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.onClick}
                    className="btn btn-primary px-8 rounded-2xl shadow-lg shadow-primary/20 gap-2">
                    <Plus size={20} />
                    {action.label}
                </motion.button>
            )}
        </motion.div>
    );
};

export default EmptyState;
