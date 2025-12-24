'use client';

import { CalendarDays, Check } from 'lucide-react';
import { useActionState, useCallback, useState } from 'react';
import DateSelect from './DateSelect';
import { toast } from 'sonner';

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
};

const SelectDropdown = ({ onRangeChange }: Props) => {
    const [selected, setSelected] = useState('');
    const [dateRange, setDateRange] = useState<{
        start: { date: Date | undefined; label: string };
        end: { date: Date | undefined; label: string };
    }>({ start: { date: undefined, label: 'All Time' }, end: { date: undefined, label: 'All Time' } });

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

    return (
        <>
            <div className="dropdown">
                <div
                    tabIndex={0}
                    role="button"
                    aria-disabled
                    className="btn btn-outline join-item p-3">
                    <CalendarDays />{' '}
                    {`${dateRange.start.label}${
                        dateRange.start.label === dateRange.end.label ? '' : ' - '
                    }${dateRange.start.label === dateRange.end.label ? '' : dateRange.end.label}`}
                </div>
                <ul
                    tabIndex={-1}
                    className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
                    onClick={() => (document.activeElement as HTMLElement).blur()}>
                    {options.map((option: string, i: number) => (
                        <li onClick={() => handleSelect(option)} key={i}>
                            <div className="flex gap-2">
                                {option === selected && <Check size={20} />}
                                <a className={option !== selected ? 'ml-7' : ''}>{option}</a>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <input type="checkbox" id="modal-toggle" className="modal-toggle" />
            <div className="modal" role="dialog z-100">
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
