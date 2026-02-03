import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export type AccountDropdownOption = { name: string; type: string; id: string };

interface AccountDropDownProps {
    options: AccountDropdownOption[];
    className?: string;
    onSelect?: (option: AccountDropdownOption) => void;
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
    const [internalSelectedId, setInternalSelectedId] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isTop, setIsTop] = useState(false);

    const isControlled = selectedId !== undefined;

    const selectedOption = useMemo(() => {
        const preferredId = isControlled ? selectedId : internalSelectedId;
        if (preferredId) {
            const found = options.find((o) => o.id === preferredId);
            if (found) return found;
        }

        if (defaultValue && options.length > 0) {
            return options[0];
        }

        return { name: '', type: '', id: '' };
    }, [defaultValue, internalSelectedId, isControlled, options, selectedId]);

    const handleSelect = (option: AccountDropdownOption) => {
        if (!isControlled) {
            setInternalSelectedId(option.id);
        }
        setIsOpen(false);
        if (onSelect) {
            onSelect(option);
        }
    };

    useEffect(() => {
        if (!isControlled && defaultValue && options.length > 0 && !internalSelectedId) {
            onSelect?.(options[0]);
        }
    }, [defaultValue, internalSelectedId, isControlled, onSelect, options]);

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
                    title={selectedOption.name || placeholder}
                    className={selectedOption.name ? 'truncate' : 'text-gray-500 truncate'}>
                    {selectedOption.name || placeholder}
                </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                </motion.div>
            </div>
            <input type="hidden" name={name} value={selectedOption.id} />

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
                                            {option.id === selectedOption.id && <Check size={18} />}
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
