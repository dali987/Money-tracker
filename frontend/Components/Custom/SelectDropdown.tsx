'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SelectDropdown = ({
    options,
    className,
    onSelect,
    disabled,
    name,
    defaultValue,
    placeholder,
    id,
}: {
    options: (string | { label: string; value: string })[];
    className?: string;
    onSelect?: (value: string) => void;
    disabled?: boolean;
    name?: string;
    defaultValue?: string;
    placeholder?: string;
    id?: string;
}) => {
    const [selected, setSelected] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isTop, setIsTop] = useState(false);

    const handleSelect = (option: string | { label: string; value: string }) => {
        const value = typeof option === 'string' ? option : option.value;
        setSelected(value);
        setIsOpen(false);
        if (onSelect) {
            onSelect(value);
        }
    };

    useEffect(() => {
        if (defaultValue !== undefined) {
            setSelected(defaultValue);
        } else if (options.length > 0) {
            const first = options[0];
            setSelected(typeof first === 'string' ? first : first.value);
        }
    }, [defaultValue, options]);

    // Handle clicks outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = () => {
        if (disabled) return;

        // Calculate position before opening
        if (!isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const isBottomHalf = rect.top > window.innerHeight / 2;
            setIsTop(isBottomHalf);
        }

        setIsOpen(!isOpen);
    };

    const getSelectedLabel = () => {
        const found = options.find((o) =>
            typeof o === 'string' ? o === selected : o.value === selected
        );
        if (!found) return placeholder || '';
        return typeof found === 'string' ? found : found.label;
    };

    return (
        <div
            className={`relative w-full ${className} ${
                disabled ? 'cursor-not-allowed' : ''
            }`}
            ref={dropdownRef}>
            <div
                id={id}
                tabIndex={0}
                role="button"
                onClick={toggleDropdown}
                className={`btn w-full justify-between rounded-box normal-case font-normal focus:outline-offset-0 focus:outline-1 focus:shadow-lg transition ${
                    disabled
                        ? 'bg-base-300 cursor-not-allowed border-none'
                        : 'bg-base-100 border-base-content/20'
                }`}>
                <span className={selected ? 'truncate' : 'text-gray-500 truncate'}>
                    {getSelectedLabel()}
                </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                </motion.div>
            </div>
            <input type="hidden" name={name} value={selected} />

            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.ul
                        initial={{ opacity: 0, scale: 0.95, y: isTop ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: isTop ? 10 : -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        tabIndex={0}
                        className={`absolute z-100 menu flex-col flex-nowrap bg-base-100 rounded-box w-full lg:min-w-56 shadow-2xl p-2 max-h-60 overflow-y-auto outline-none border border-base-content/10 ${
                            isTop ? 'bottom-full mb-2' : 'top-full mt-2'
                        }`}>
                        {options.map((option, i) => {
                            const value = typeof option === 'string' ? option : option.value;
                            const label = typeof option === 'string' ? option : option.label;
                            return (
                                <li key={i}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className="flex justify-between items-center py-2 px-3 rounded-lg transition-colors">
                                        <div className="flex items-center gap-2 overflow-hidden text-sm">
                                            <div className="w-5 shrink-0">
                                                {value === selected && <Check size={18} />}
                                            </div>
                                            <span className="truncate" title={label}>
                                                {label}
                                            </span>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                        {options.length === 0 && (
                            <li className="p-4 text-gray-400 italic text-center text-xs">
                                No options found
                            </li>
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SelectDropdown;
