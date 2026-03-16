import { useEffect, RefObject, useCallback } from 'react';

/**
 * Detects clicks outside a referenced element and fires a callback.
 * Listeners are only active when `enabled` is true.
 */
export const useClickOutside = (
    ref: RefObject<HTMLElement | null>,
    onClickOutside: () => void,
    enabled: boolean = true,
) => {
    const handleEvent = useCallback(
        (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClickOutside();
            }
        },
        [ref, onClickOutside],
    );

    useEffect(() => {
        if (!enabled) return;

        document.addEventListener('mousedown', handleEvent);

        return () => {
            document.removeEventListener('mousedown', handleEvent);
        };
    }, [enabled, handleEvent]);
};
