import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type AccountDropdownOption = { name: string; type: string; id: string };

interface AccountDropDownProps {
    options: AccountDropdownOption[];
    className?: string;
    onSelect?: any;
    disabled?: boolean;
    name?: string;
    defaultValue?: boolean;
    placeholder?: string;
    selectedId?: string;
}

const SelectAccountDropdown = ({
    options,
    className,
    onSelect,
    disabled,
    name,
    defaultValue,
    placeholder,
    selectedId,
}: AccountDropDownProps) => {
    const [selected, setSelected] = useState({ name: '', type: '', id: '' });
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isTop, setIsTop] = useState(false);

    const handleSelect = (option: { name: string; type: string; id: string }) => {
        setSelected(option);
        setIsOpen(false);
        if (onSelect) {
            onSelect(option);
        }
    };

    useEffect(() => {
        if (
            options.length > 0 &&
            defaultValue &&
            (!selected.id || !options.find((o) => o.id === selected.id))
        ) {
            setSelected(options[0]);
            if (onSelect) {
                onSelect(options[0]);
            }
        }
    }, [options, selected.id, defaultValue]);

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

    useEffect(() => {
        if (selectedId !== undefined) {
            const found = options.find((o) => o.id === selectedId);
            if (found) {
                setSelected(found);
            } else {
                setSelected({ name: '', type: '', id: '' });
            }
        }
    }, [selectedId, options]);

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

    return (
        <div
            className={`relative w-full mb-4 ${className} ${disabled ? 'cursor-not-allowed' : ''}`}
            ref={dropdownRef}>
            <div
                tabIndex={0}
                role="button"
                onClick={toggleDropdown}
                className={`btn w-full justify-between rounded-box normal-case font-normal ${
                    disabled
                        ? 'bg-base-300 cursor-not-allowed border-none'
                        : 'bg-base-100 border-base-content/20'
                }`}>
                <span
                    id="selectedText"
                    title={selected.name || placeholder}
                    className={selected.name ? 'truncate' : 'text-gray-500 truncate'}>
                    {selected.name || placeholder}
                </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                </motion.div>
            </div>
            <input type="hidden" name={name} value={selected.id} />

            <AnimatePresence>
                {isOpen && !disabled && (
                    <motion.ul
                        initial={{ opacity: 0, scale: 0.95, y: isTop ? 10 : -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: isTop ? 10 : -10 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        tabIndex={0}
                        className={`absolute z-100 menu flex-col flex-nowrap bg-base-100 rounded-box w-full shadow-2xl p-2 max-h-48 overflow-y-auto outline-none border border-base-content/10 ${
                            isTop ? 'bottom-full mb-2' : 'top-full mt-2'
                        }`}>
                        {options.map((option: { name: string; type: string; id: string }, i) => (
                            <li key={i}>
                                <button
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className="flex justify-between items-center py-2 px-3 rounded-lg transition-colors">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-5 shrink-0">
                                            {option.name === selected.name && <Check size={18} />}
                                        </div>
                                        <span className="truncate" title={option.name}>
                                            {option.name}
                                        </span>
                                    </div>
                                    <span className="text-gray-500 text-xs shrink-0">
                                        {option.type}
                                    </span>
                                </button>
                            </li>
                        ))}
                        {options.length === 0 && (
                            <li className="p-4 text-gray-400 italic text-center text-xs">
                                No accounts found
                            </li>
                        )}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SelectAccountDropdown;
