'use client';
import { useState } from 'react';

const NumberInput = ({
    className,
    name,
    disabled,
}: {
    className?: string;
    name?: string;
    disabled?: boolean;
}) => {
    const [number, setNumber] = useState(0);

    return (
        <div className={`relative min-w-45 h-10 ${className}`}>
            <button
                className="absolute right-10 top-1/2 -translate-y-1/2 rounded-md p-1.5 active:bg-base-300 transition-all hover:bg-base-200 focus:bg-base-100 disabled:pointer-events-none disabled:shadow-none z-100 select-none"
                type="button"
                disabled={disabled}
                onClick={() => setNumber((prev) => prev - 1)}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-4 h-4">
                    <path d="M3.75 7.25a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5Z" />
                </svg>
            </button>
            <input
                id="amountInput"
                type="number"
                name={name}
                disabled={disabled}
                value={number.toString()}
                onChange={(e) => setNumber(Number(e.target.value))}
                className="w-full h-full input rounded-md transition focus:outline-offset-0 focus:outline-1 shadow-sm focus:shadow-lg appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 active:bg-base-300 transition-all hover:bg-base-200 focus:bg-base-100 disabled:pointer-events-none disabled:shadow-none z-100 select-none"
                type="button"
                disabled={disabled}
                onClick={() => setNumber((prev) => prev + 1)}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-4 h-4">
                    <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5Z" />
                </svg>
            </button>
        </div>
    );
};

export default NumberInput;
