'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';

const SelectAccountDropdown = ({
    options,
    className,
    onSelect,
    disabled
}: {
    options: { name: string; type: string; id: string }[];
    className?: string;
    onSelect?: any;
    disabled?: boolean;
}) => {
    const [selected, setSelected] = useState({ name: '', type: '', id: '' })

    const handleSelect = (option: {
        name: string;
        type: string;
        id: string;
    }) => {
        setSelected(option);
        (document.activeElement as HTMLElement)?.blur();
        onSelect(option);
    };

    useEffect(() => {
        if (options.length > 0 && (!selected.id || !options.find(o => o.id === selected.id))) {
            setSelected(options[0]);
            onSelect(options[0]);
        }
    }, [options, onSelect, selected.id]);

    return (
        <div className={`dropdown ${disabled && " cursor-not-allowed"} mb-4 ${className}`}>
            <label tabIndex={0} className={`btn w-full justify-between ${disabled && "bg-base-300 cursor-not-allowed"}`}>
                <span id="selectedText">{selected.name}</span>
                <svg
                    className="h-4 w-4 opacity-70"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </label>

            {!disabled && (<ul
                tabIndex={0}
                className={` dropdown-content menu bg-base-100 rounded-box w-full shadow `}
            >
                {options.map(
                    (option: { name: string; type: string; id: string }, i) => (
                        <li onClick={() => handleSelect(option)} key={i}>
                            <div className="flex justify-between">
                                <div className="flex gap-1">
                                    {option.name === selected.name ? (
                                        <Check />
                                    ) : null}
                                    <span
                                        className={`${
                                            option.name === selected.name
                                                ? ''
                                                : 'ml-7'
                                        }`}
                                    >
                                        {option.name}
                                    </span>
                                </div>
                                <span className="text-gray-500">
                                    {option.type}
                                </span>
                            </div>
                        </li>
                    )
                )}
            </ul>)}
        </div>
    );
};

export default SelectAccountDropdown;
