'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomModalProps {
    children: React.ReactNode;
    Icon?: React.ComponentType<{ className?: string }>;
    title: string;
    autoClose?: boolean;
    closeButton?: boolean;
    isOpen: boolean;
    onClose: () => void;
}

const CustomModal = ({
    children,
    Icon,
    title,
    autoClose = false,
    closeButton = true,
    isOpen,
    onClose,
}: CustomModalProps) => {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <motion.div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={autoClose ? onClose : undefined}
                    />

                    <motion.div
                        className="modal-box w-full max-w-xl p-0 overflow-hidden bg-white dark:bg-base-100 rounded-2xl border border-zinc-200 dark:border-base-300 shadow-2xl relative z-10"
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-zinc-100 dark:border-base-200 flex justify-between items-center bg-zinc-100 dark:bg-base-200/50">
                            <div className="flex items-center gap-2">
                                {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
                                <h2 className="text-lg font-bold text-zinc-800 dark:text-base-content">
                                    {title}
                                </h2>
                            </div>
                            {closeButton && (
                                <button
                                    onClick={onClose}
                                    className="btn btn-sm btn-circle btn-ghost">
                                    ✕
                                </button>
                            )}
                        </div>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CustomModal;
