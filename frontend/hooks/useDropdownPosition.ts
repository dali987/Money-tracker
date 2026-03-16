import { useState, useCallback, RefObject } from 'react';

/**
 * Calculates whether a dropdown should open above or below its trigger.
 * Uses available space heuristics: opens above only when there's less than
 * `threshold` px below AND more space above than below.
 */
export const useDropdownPosition = (
    ref: RefObject<HTMLElement | null>,
    threshold: number = 250,
) => {
    const [isTop, setIsTop] = useState(false);

    const updatePosition = useCallback(() => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        setIsTop(spaceBelow < threshold && spaceAbove > spaceBelow);
    }, [ref, threshold]);

    return { isTop, updatePosition };
};
