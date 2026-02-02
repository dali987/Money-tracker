import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';

interface CustomCollapseProps {
    id?: string;
    title: string;
    rightContent?: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    className?: string;
    closable?: boolean;
    layout?: boolean;
}

const CustomCollapse = ({
    id,
    title,
    rightContent,
    children,
    defaultOpen = true,
    className = 'bg-base-100 rounded-box shadow-sm',
    closable = true,
    layout,
}: CustomCollapseProps) => {
    const [isCollapseOpen, setIsCollapseOpen] = useState(closable ? defaultOpen : true);

    return (
        <motion.div
            layout={layout || 'size'}
            initial={false}
            className={`font-mono overflow-visible w-full ${className}`}>
            <motion.button
                id={id}
                layout="position"
                type="button"
                onClick={() => closable && setIsCollapseOpen(!isCollapseOpen)}
                className={`w-full flex justify-between bg-base-100 items-center p-4 lg:p-6 font-bold text-xl text-left transition-colors ${
                    closable ? 'hover:bg-base-300 cursor-pointer' : 'cursor-default'
                } ${isCollapseOpen ? 'rounded-t-box' : 'rounded-box'}`}>
                <span className="ps-8 relative">{title}</span>
                <div className="flex items-center gap-4">
                    {rightContent}
                    {closable && (
                        <motion.span
                            animate={{ rotate: isCollapseOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="text-gray-400">
                            <ChevronDown size={24} />
                        </motion.span>
                    )}
                </div>
            </motion.button>

            <AnimatePresence initial={false} mode="sync">
                {isCollapseOpen && (
                    <motion.div
                        key="collapse-content"
                        variants={{
                            hidden: { height: 0, opacity: 0 },
                            visible: {
                                height: 'auto',
                                opacity: 1,
                                transition: {
                                    height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                                    opacity: { duration: 0.2, delay: 0.05 },
                                },
                            },
                        }}
                        initial="hidden"
                        animate="visible"
                        exit="hidden">
                        <motion.div
                            style={{ overflow: isCollapseOpen ? 'visible' : 'hidden' }}
                            className="p-4 lg:p-6 pt-0 bg-base-100/50">
                            {children}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default CustomCollapse;
