'use client';

import { useState, useEffect, useRef } from 'react';

export default function MultiSelectDropdown({
    formFieldName,
    options,
    prompt = 'Select one or more options',
    className,
    onSelect,
    selected
}: {
    formFieldName: string;
    options: string[];
    prompt?: string;
    className?: string;
    onSelect?: any;
    selected?: any;
}) {
    const [isJsEnabled, setIsJsEnabled] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const optionsListRef = useRef(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const option = e.target.value;

        const selectedOptionSet = new Set(selectedOptions);

        if (isChecked) {
            selectedOptionSet.add(option as never);
        } else {
            selectedOptionSet.delete(option as never);
        }

        const newSelectedOptions = Array.from(selectedOptionSet);

        setSelectedOptions(newSelectedOptions);
        onSelect(newSelectedOptions)
    };

    const isSelectAllEnabled = selectedOptions.length < options.length;

    const handleSelectAllClick = (e: React.MouseEvent<HTMLButtonElement>) => {

        // Ensure optionsListRef.current is not null before querying
        if (optionsListRef.current) {
            const optionsInputs = (optionsListRef.current as HTMLElement).querySelectorAll('input');
            optionsInputs.forEach((input) => {
                input.checked = true;
            });
        }

        // Cast options to never[] to satisfy the type checker
        setSelectedOptions([...options] as never[]);
    };

    const isClearSelectionEnabled = selectedOptions.length > 0;

    const handleClearSelectionClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        // Ensure optionsListRef.current is not null before querying
        if (optionsListRef.current) {
            const optionsInputs = (optionsListRef.current as HTMLElement).querySelectorAll('input');
            optionsInputs.forEach((input) => {
                input.checked = false;
            });
        }

        setSelectedOptions([]);
    };

    useEffect(() => {
        setIsJsEnabled(true);
        console.log(selected)
    }, [selectedOptions]);


    return (
        <div className={`dropdown ${className}`}>
            {/* <label className="input cursor-pointer after:content-['▼'] after:text-xs after:ml-1 after:absolute after:top-1/2 after:right-2 after:-translate-y-1/2 peer-checked:after:-rotate-180 after:transition-transform inline-flex px-5 py-2">
                {prompt}
                {isJsEnabled && selectedOptions.length > 0 && (
                    <span className="ml-1 text-blue-500">{`(${selectedOptions.length})`}</span>
                )}
            </label> */}

            <div
                tabIndex={0}
                role='button'
                className="btn w-full justify-between">
                <span id="selectedText">{prompt}</span>
                {isJsEnabled && selectedOptions.length > 0 && (
                    <span className="ml-1 text-blue-500">{`(${selectedOptions.length})`}</span>
                )}
                <svg
                    className="h-4 w-4 opacity-70"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>

            <ul className="dropdown-content menu none active:flex flex-col flex-nowrap w-full max-h-25 scroll-smooth overflow-y-scroll bg-base-100 shadow-sm rounded-box" ref={optionsListRef} tabIndex={-1}>
                {isJsEnabled && (
                    <>
                        <li>
                            <button
                                onClick={handleSelectAllClick}
                                disabled={!isSelectAllEnabled}
                                className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50 cursor-pointer">
                                {'Select All'}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={handleClearSelectionClick}
                                disabled={!isClearSelectionEnabled}
                                className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50 cursor-pointer">
                                {'Clear selection'}
                            </button>
                        </li>
                        {options.map((option, i) => (
                            <li key={option}>
                                <label
                                    className={`flex whitespace-nowrap cursor-pointer px-2 py-1 transition-colors`}>
                                    <input
                                        type="checkbox"
                                        name={formFieldName}
                                        value={option}
                                        className="checkbox active:checkbox-neutral"
                                        onChange={handleChange}
                                    />
                                    <span className="ml-1 text-base">{option}</span>
                                </label>
                            </li>
                        )
                    )}
                    </>
                )}

            </ul>
        </div>
    );
}
