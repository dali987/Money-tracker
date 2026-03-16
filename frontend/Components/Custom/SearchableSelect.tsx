'use client';

import { useMemo, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useClickOutside } from '@/hooks/useClickOutside';

interface Option {
    label: React.ReactNode;
    value: string;
    searchText: string;
}

interface SearchableSelectProps {
    options: Option[];
    onSelect: (val: string) => void;
    placeholder: string;
    name: string;
    defaultValue?: string;
}

const SearchableSelect = ({
    options,
    onSelect,
    placeholder,
    name,
    defaultValue,
}: SearchableSelectProps) => {
    const [search, setSearch] = useState('');
    const [selectedValue, setSelectedValue] = useState<string | null>(null);
    const [hasUserSelection, setHasUserSelection] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = useMemo(() => {
        if (selectedValue) {
            return options.find((o) => o.value === selectedValue) || null;
        }
        if (!hasUserSelection && defaultValue) {
            return options.find((o) => o.value === defaultValue) || null;
        }
        return null;
    }, [defaultValue, hasUserSelection, options, selectedValue]);

    const filtered = useMemo(() => {
        if (!search) return options;
        return options.filter((option) =>
            option.searchText.toLowerCase().includes(search.toLowerCase()),
        );
    }, [search, options]);

    const closeFocused = useCallback(() => setIsFocused(false), []);
    useClickOutside(dropdownRef, closeFocused, isFocused);

    return (
        <div className={`dropdown w-full ${isFocused ? 'dropdown-open' : ''}`} ref={dropdownRef}>
            <div className="relative w-full">
                <input type="hidden" name={name} value={selectedOption?.value ?? ''} />
                <input
                    type="text"
                    placeholder={selectedOption ? '' : placeholder}
                    value={search}
                    onFocus={(e) => {
                        setIsFocused(true);
                        const rect = e.currentTarget.getBoundingClientRect();
                        const isBottomHalf = rect.top > window.innerHeight / 2;
                        const parent = e.currentTarget.closest('.dropdown');
                        if (parent) {
                            if (isBottomHalf) parent.classList.add('dropdown-top');
                            else parent.classList.remove('dropdown-top');
                        }
                    }}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        if (selectedValue !== null || !hasUserSelection) {
                            setSelectedValue(null);
                            setHasUserSelection(true);
                        }
                        setIsFocused(true);
                    }}
                    className="input input-bordered w-full"
                    autoComplete="off"
                />

                {selectedOption && !search && !isFocused && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none w-[calc(100%-40px)]">
                        <div className="truncate scale-95 origin-left text-sm">
                            {selectedOption.label}
                        </div>
                    </div>
                )}

                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <motion.svg
                        animate={{ rotate: isFocused ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-4 text-gray-400">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                        />
                    </motion.svg>
                </div>
            </div>

            <AnimatePresence>
                {isFocused && (
                    <motion.ul
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="dropdown-content menu flex-col flex-nowrap rounded-box bg-base-100 w-full shadow-xl max-h-60 mt-1 overflow-y-auto z-100 block">
                        {filtered.length > 0 ? (
                            filtered.map((opt) => (
                                <li key={opt.value}>
                                    <button
                                        type="button"
                                        className="flex justify-start gap-2 py-3 text-sm"
                                        onClick={() => {
                                            setSelectedValue(opt.value);
                                            setHasUserSelection(true);
                                            onSelect(opt.value);
                                            setSearch('');
                                            setIsFocused(false);
                                        }}>
                                        {opt.label}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="p-4 text-gray-400 italic text-xs">No results found</li>
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SearchableSelect;
