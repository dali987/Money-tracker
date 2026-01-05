import { CalendarDays, Check, ChevronDown } from 'lucide-react';
import { useActionState, useCallback, useState, useRef, useEffect } from 'react';
import DateSelect from './DateSelect';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

const options = [
    'Today',
    'Yesterday',
    'Last 7 days',
    'Last 30 days',
    'This month',
    'All time',
    'Custom',
];

type Props = {
    // optional prop: where to handle filtering (preferred for separation of concerns)
    onRangeChange?: (range: { start: string | null; end: string | null; label: string }) => void;
    className?: string;
};

const SelectDropdown = ({ onRangeChange, className }: Props) => {
    const [selected, setSelected] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isTop, setIsTop] = useState(false);
    const [dateRange, setDateRange] = useState<{
        start: { date: Date | undefined; label: string };
        end: { date: Date | undefined; label: string };
    }>({
        start: { date: undefined, label: 'All Time' },
        end: { date: undefined, label: 'All Time' },
    });

    const formatDate = useCallback((date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
        });
    }, []);

    const getDateRange = useCallback(
        (option: string) => {
            const today = new Date();
            let start = new Date();
            start.setHours(0, 0, 0, 0);
            let end = new Date();
            end.setHours(23, 59, 59, 999);

            switch (option) {
                case 'Today':
                    break;

                case 'Yesterday':
                    start.setDate(start.getDate() - 1);
                    end.setDate(end.getDate() - 1);
                    break;

                case 'Last 7 days':
                    start.setDate(end.getDate() - 7);
                    break;

                case 'Last 30 days':
                    start.setDate(end.getDate() - 30);
                    break;

                case 'This month':
                    start = new Date(today.getFullYear(), today.getMonth(), 1);
                    break;
                case 'All time':
                    break;
                case 'Custom':
                    break;
            }

            if (option === 'All time') {
                return {
                    start: { date: undefined, label: 'All Time' },
                    end: { date: undefined, label: 'All Time' },
                };
            }

            return {
                start: { date: start, label: formatDate(start) },
                end: { date: end, label: formatDate(end) },
            };
        },
        [formatDate]
    );

    const handleSelect = useCallback(
        (option: string) => {
            setSelected(option);
            setIsOpen(false);
            if (option !== 'Custom') {
                const range = getDateRange(option);
                setDateRange(range);
                if (onRangeChange) {
                    onRangeChange({
                        start: range.start.date ? range.start.date.toISOString() : null,
                        end: range.end.date ? range.end.date.toISOString() : null,
                        label: option,
                    });
                }
            } else (document.getElementById('modal-toggle') as HTMLInputElement).checked = true;
        },
        [getDateRange, onRangeChange]
    );

    const handleFormSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formDate = new FormData(e.currentTarget as HTMLFormElement);

            const start = (
                formDate.get('start') !== 'Pick a date' ? formDate.get('start') : ''
            ) as string;
            const end = (
                formDate.get('end') !== 'Pick a date' ? formDate.get('end') : ''
            ) as string;

            if (start === '' || end === '') {
                toast.error('Please pick both start and end dates');
                return;
            }
            if (new Date(start) > new Date(end)) {
                toast.error('end date is before start date');
            }

            const startDate = new Date(start);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(end);
            endDate.setHours(23, 59, 59, 999);

            setDateRange({
                start: { date: startDate, label: formatDate(startDate) },
                end: { date: endDate, label: formatDate(endDate) },
            });

            if (onRangeChange) {
                onRangeChange({
                    start: startDate.toISOString(),
                    end: endDate.toISOString(),
                    label: 'Custom',
                });
            }
        },
        [formatDate, onRangeChange]
    );

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
        <>
            <div className={`relative ${className || ''}`} ref={dropdownRef}>
                <button
                    type="button"
                    onClick={toggleDropdown}
                    className="btn btn-outline border-base-content/20 join-item p-3 justify-between font-normal min-w-[180px]">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span className="text-sm truncate">
                            {`${dateRange.start.label}${
                                dateRange.start.label === dateRange.end.label ? '' : ' - '
                            }${
                                dateRange.start.label === dateRange.end.label
                                    ? ''
                                    : dateRange.end.label
                            }`}
                        </span>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}>
                        <ChevronDown className="h-4 w-4 opacity-50 ml-1 shrink-0" />
                    </motion.div>
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <motion.ul
                            initial={{ opacity: 0, scale: 0.95, y: isTop ? 10 : -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: isTop ? 10 : -10 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            tabIndex={-1}
                            className={`absolute z-100 menu bg-base-100 rounded-box w-52 p-2 shadow-2xl border border-base-content/10 ${
                                isTop ? 'bottom-full mb-2' : 'top-full mt-2'
                            }`}>
                            {options.map((option: string, i: number) => (
                                <li key={i}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className="flex items-center gap-2 py-2 px-3 rounded-lg transition-colors w-full text-left">
                                        <div className="w-4 shrink-0">
                                            {option === selected && <Check size={16} />}
                                        </div>
                                        <span className="text-sm">{option}</span>
                                    </button>
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
            <input type="checkbox" id="modal-toggle" className="modal-toggle" />
            <div className="modal" role="dialog">
                <form className="modal-box" onSubmit={(e) => handleFormSubmit(e)}>
                    <h3 className="text-lg font-bold p-2 pb-6">Custom Date</h3>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="label text-base text-base-content">Start Date</label>
                            <DateSelect name="start" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="label text-base text-base-content">End Date</label>
                            <DateSelect name="end" />
                        </div>
                    </div>
                    <div className="modal-action">
                        <button
                            className="btn bg-green-500 text-white hover:bg-green-700 rounded"
                            onClick={() =>
                                ((document.getElementById(
                                    'modal-toggle'
                                ) as HTMLInputElement)!.checked = false)
                            }
                            type="submit">
                            Select Date
                        </button>
                    </div>
                </form>
                <label className="modal-backdrop" htmlFor="modal-toggle">
                    Close
                </label>
            </div>
        </>
    );
};

export default SelectDropdown;
