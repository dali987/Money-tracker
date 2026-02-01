'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef, useId, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SelectDropdownProps {
    options: (string | { label: string; value: string; className?: string })[];
    className?: string;
    onSelect?: (value: string) => void;
    disabled?: boolean;
    name?: string;
    defaultValue?: string;
    placeholder?: string;
    id?: string;
    trigger?: React.ReactNode;
    showSelected?: boolean;
    menuClassName?: string;
}

const SelectDropdown = ({
    options,
    className = '',
    onSelect,
    disabled = false,
    name,
    defaultValue,
    placeholder,
    id,
    trigger,
    showSelected = true,
    menuClassName = 'w-full lg:min-w-56',
}: SelectDropdownProps) => {
    const [selected, setSelected] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [isTop, setIsTop] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);
    const instanceId = useId();

    // Prevent parent interactions (e.g., card clicks)
    const stopPropagation = useCallback((e: React.SyntheticEvent) => {
        e.stopPropagation();
        // Prevent generic clicks, but allow form events if needed
    }, []);

    // Initial value checks
    useEffect(() => {
        if (defaultValue !== undefined) {
            setSelected(defaultValue);
        } else if (options.length > 0 && showSelected && !placeholder) {
            const first = options[0];
            setSelected(typeof first === 'string' ? first : first.value);
        }
    }, [defaultValue, options, showSelected, placeholder]);

    // Outside click & singular open logic
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleCloseOthers = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail?.id !== instanceId) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            window.addEventListener('money-tracker-dropdown-open', handleCloseOthers);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('money-tracker-dropdown-open', handleCloseOthers);
        };
    }, [isOpen, instanceId]);

    const toggleDropdown = (e?: React.MouseEvent | React.KeyboardEvent) => {
        e?.stopPropagation();
        if (disabled) return;

        const nextOpen = !isOpen;

        if (nextOpen) {
            // Smart positioning
            if (dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                // Prefer bottom, flip to top if barely any space below and tons above
                setIsTop(spaceBelow < 250 && spaceAbove > spaceBelow);
            }

            // Close others
            window.dispatchEvent(
                new CustomEvent('money-tracker-dropdown-open', {
                    detail: { id: instanceId },
                }),
            );
        }

        setIsOpen(nextOpen);
    };

    const handleSelect = (
        option: string | { label: string; value: string; className?: string },
    ) => {
        const value = typeof option === 'string' ? option : option.value;
        setSelected(value);
        setIsOpen(false); // Select always closes
        onSelect?.(value);
    };

    // Keyboard Navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                toggleDropdown(e);
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            case 'ArrowDown':
            case 'ArrowUp':
                if (!isOpen) {
                    setIsOpen(true);
                }
                // Future: Focus management for options could go here
                break;
        }
    };

    const getSelectedLabel = () => {
        const found = options.find((o) =>
            typeof o === 'string' ? o === selected : o.value === selected,
        );
        if (!found) return placeholder || '';
        return typeof found === 'string' ? found : found.label;
    };

    return (
        <div
            ref={dropdownRef}
            className={`relative inline-block text-left ${!trigger ? 'w-full' : ''} ${className}`}
            onClick={stopPropagation} // Catch-all for click bubbling
            onMouseDown={stopPropagation} // Catch-all for dragging/interaction starts
            onPointerDown={stopPropagation} // Catch-all for pointer events
        >
            {/* Hidden input for form submission */}
            <input type="hidden" name={name} value={selected} />

            <div
                role="combobox"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-controls={`dropdown-list-${instanceId}`}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onKeyDown={handleKeyDown}
                onClick={toggleDropdown}
                className={`focus:outline-none ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                {trigger ? (
                    trigger
                ) : (
                    <div
                        className={`btn w-full justify-between rounded-box normal-case font-normal border transition-all duration-200
                        ${
                            disabled
                                ? 'bg-base-200 border-base-200 text-base-content/50'
                                : 'bg-base-100 border-base-content/20 hover:border-base-content/40 focus:border-primary focus:ring-1 focus:ring-primary'
                        } ${isOpen ? 'border-primary ring-1 ring-primary' : ''}`}>
                        <span
                            className={`truncate ${!selected && placeholder ? 'text-base-content/50' : ''}`}>
                            {getSelectedLabel()}
                        </span>
                        <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-base-content/70">
                            <ChevronDown size={16} />
                        </motion.div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.ul
                        id={`dropdown-list-${instanceId}`}
                        role="listbox"
                        ref={listboxRef}
                        initial={{ opacity: 0, scale: 0.95, y: isTop ? 8 : -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: isTop ? 8 : -8 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className={`absolute z-100 flex flex-col gap-0.5 bg-base-100 rounded-xl shadow-xl p-1.5 
                            max-h-60 overflow-y-auto border border-base-content/10 focus:outline-none
                            ${isTop ? 'bottom-full mb-2' : 'top-full mt-2'} 
                            ${menuClassName || 'w-full'} 
                            ${trigger ? 'right-0 min-w-[200px]' : 'left-0 w-full'}
                        `}>
                        {options.map((option, i) => {
                            const value = typeof option === 'string' ? option : option.value;
                            const label = typeof option === 'string' ? option : option.label;
                            const optionClassName =
                                typeof option === 'string' ? '' : option.className || '';
                            const isSelected = value === selected;

                            return (
                                <li
                                    key={`${value}-${i}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => handleSelect(option)}
                                    className={`
                                        relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors select-none
                                        ${isSelected ? 'bg-primary/10 text-primary font-medium' : 'text-base-content hover:bg-base-200/70'}
                                        ${optionClassName}
                                    `}>
                                    <span className="truncate mr-2">{label}</span>
                                    {showSelected && isSelected && (
                                        <Check size={16} className="shrink-0" />
                                    )}
                                </li>
                            );
                        })}
                        {options.length === 0 && (
                            <li className="p-3 text-base-content/50 text-center text-sm italic">
                                No options available
                            </li>
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SelectDropdown;
