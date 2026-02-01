'use client';

import React from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export const ErrorState = ({
    message = 'Something went wrong while loading data.',
    onRetry,
    className = '',
}: ErrorStateProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center p-8 rounded-2xl bg-error/5 border border-error/20 text-center gap-4 ${className}`}>
            <div className="p-3 rounded-full bg-error/10 text-error">
                <AlertTriangle size={32} />
            </div>
            <div className="space-y-1">
                <h3 className="font-bold text-lg">Oops!</h3>
                <p className="text-base-content/70 max-w-xs mx-auto text-sm">{message}</p>
            </div>
            {onRetry && (
                <button onClick={onRetry} className="btn btn-error btn-outline btn-sm gap-2 group">
                    <RefreshCcw
                        size={16}
                        className="group-hover:rotate-180 transition-transform duration-500"
                    />
                    Try Again
                </button>
            )}
        </motion.div>
    );
};

export default ErrorState;
