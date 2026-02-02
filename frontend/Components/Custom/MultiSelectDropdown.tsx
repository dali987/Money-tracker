'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface Option {
    label: React.ReactNode;
    value: string;
}

interface MultiSelectProps {
    formFieldName: string;
    options: Option[];
    prompt?: string;
    className?: string;
    onSelect?: (values: string[]) => void;
    selected?: string[];
}

const EMPTY_ARRAY: string[] = [];

export default function MultiSelectDropdown({
    formFieldName,
    options,
    prompt = 'Select options',
    className = '',
    onSelect,
    selected = EMPTY_ARRAY,
}: MultiSelectProps) {
    // Internal state synced with the 'selected' prop
    const [selectedValues, setSelectedValues] = useState<string[]>(EMPTY_ARRAY);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isTop, setIsTop] = useState(false);

    useEffect(() => {
        setSelectedValues(selected);
    }, [selected]);

    const handleToggle = (value: string) => {
        const newSelection = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];

        setSelectedValues(newSelection);
        onSelect?.(newSelection);
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedValues([]);
        onSelect?.([]);
    };

    const isClearEnabled = selectedValues.length > 0;

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
        if (!isOpen && dropdownRef.current) {
            const rect = dropdownRef.current.getBoundingClientRect();
            const isBottomHalf = rect.top > window.innerHeight / 2;
            setIsTop(isBottomHalf);
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            <input type="hidden" name={formFieldName} value={selectedValues.join(',')} />
            <div
                tabIndex={0}
                role="button"
                onClick={toggleDropdown}
                className="btn w-full justify-between normal-case rounded-box font-normal border-base-content/20 bg-base-100 hover:bg-base-200 text-base-content">
                <div className="flex items-center gap-2 truncate overflow-hidden">
                    <span className="text-sm truncate">{prompt}</span>
                    {selectedValues.length > 0 && (
                        <span className="badge badge-sm badge-neutral shrink-0">
                            {selectedValues.length}
                        </span>
                    )}
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </motion.div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, scale: 0.95, y: isTop ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: isTop ? 10 : -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        tabIndex={0}
                        className={`absolute z-100 menu flex flex-col flex-nowrap p-2 shadow-2xl bg-base-100 rounded-box w-full max-h-52 overflow-y-auto outline-none border border-base-content/10 ${
                            isTop ? 'bottom-full mb-2' : 'top-full mt-2'
                        }`}>
                        <li className="mb-2">
                            <button
                                type="button"
                                onClick={handleClearAll}
                                disabled={!isClearEnabled}
                                className="text-error text-xs font-semibold justify-center py-2 hover:bg-error/10 disabled:opacity-30 rounded-lg">
                                Clear Selection
                            </button>
                        </li>
                        {options.map((option) => {
                            const isChecked = selectedValues.includes(option.value);
                            return (
                                <li key={option.value}>
                                    <label className="flex items-center gap-3 py-2 px-3 hover:bg-base-200 cursor-pointer active:bg-base-300 rounded-lg">
                                        <input
                                            type="checkbox"
                                            value={option.value}
                                            checked={isChecked}
                                            onChange={() => handleToggle(option.value)}
                                            className="checkbox checkbox-sm checkbox-primary rounded-md shrink-0"
                                        />
                                        <div
                                            className="flex-1 overflow-hidden text-sm truncate"
                                            title={
                                                typeof option.label === 'string'
                                                    ? option.label
                                                    : undefined
                                            }>
                                            {option.label}
                                        </div>
                                    </label>
                                </li>
                            );
                        })}

                        {options.length === 0 && (
                            <li className="p-4 text-center text-xs text-gray-400 italic">
                                No options available
                            </li>
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
