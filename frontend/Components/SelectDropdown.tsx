'use client';

import { CalendarDays, Check } from 'lucide-react';
import { useActionState, useState } from 'react';
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

const SelectDropdown = ({ className }: { className?: string }) => {
    const [selected, setSelected] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [filteredTransactions, setFilteredTransactions] = useState([]);

    const formatDate = (date: Date) => {



        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
        })
    };

    const getDateRange = (option: string) => {
        console.log(option);

        const today = new Date();
        let start = new Date();
        let end = new Date();

        switch (option) {
            case 'Today':
                start = end;
                break;

            case 'Yesterday':
                start.setDate(end.getDate() - 1);
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
            return { start: 'All time', end: 'All time' };
        }

        return {
            start: formatDate(start),
            end: formatDate(end),
        };
    };

    const handleSelect = (option: string) => {
        setSelected(option);
        if (option !== 'Custom') setDateRange(getDateRange(option));
        else (document.getElementById('modal-toggle') as HTMLInputElement).checked = true;
    };

    const handleFormSubmit = (pervState: any, formDate: FormData) => {
        try {
            console.log('runned nqslkdfhqds');
            const start = formDate.get('start') !== 'Pick a date' ? formDate.get('start') : '';
            const end = formDate.get('end') !== 'Pick a date' ? formDate.get('end') : '';

            setDateRange({ start: formatDate(new Date(start)), end: formatDate(new Date(end)) });
        } catch (error) {
            toast.error('unexpected error occurred');
            console.log(error);
        }
    };

    const [state, formAction, isPending] = useActionState(handleFormSubmit, null);

    return (
        <>
            <div className="dropdown">
                <div
                    tabIndex={0}
                    role="button"
                    aria-disabled
                    className="btn btn-outline join-item p-3">
                    <CalendarDays />{' '}
                    {`${dateRange.start}${dateRange.start === dateRange.end ? '' : ' - '}${
                        dateRange.start === dateRange.end ? '' : dateRange.end
                    }`}
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
                <form className="modal-box" action={formAction}>
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
