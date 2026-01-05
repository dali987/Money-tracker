'use client';

import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

const AnimatedNumber = ({ value, className }: { value: number; className?: string }) => {
    const spring = useSpring(value, {
        bounce: 0,
        duration: 800,
    });
    const display = useTransform(spring, (current) => current.toFixed(2));

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    return <motion.span className={className}>{display}</motion.span>;
};

export default AnimatedNumber;
