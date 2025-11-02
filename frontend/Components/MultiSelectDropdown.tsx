"use client";

import { useState, useEffect, useRef } from "react";

export default function MultiSelectDropdown({
  formFieldName,
  options,
  prompt = "Select one or more options",
  className
} : { formFieldName: string, options: string[], prompt?: string, className?: string }) {
  const [isJsEnabled, setIsJsEnabled] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const optionsListRef = useRef(null);

  useEffect(() => {
    setIsJsEnabled(true);
  }, []);

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
  };

  const isSelectAllEnabled = selectedOptions.length < options.length;

  const handleSelectAllClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Ensure optionsListRef.current is not null before querying
    if (optionsListRef.current) {
      const optionsInputs = (optionsListRef.current as HTMLElement).querySelectorAll("input");
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
      const optionsInputs = (optionsListRef.current as HTMLElement).querySelectorAll("input");
      optionsInputs.forEach((input) => {
        input.checked = false;
      });
    };

    setSelectedOptions([]);
  };

  return (
    <label className={`relative ${className}`}>
      <input type="checkbox" className="hidden peer" />

      <div className="input cursor-pointer after:content-['▼'] after:text-xs after:ml-1 after:absolute after:top-1/2 after:right-2 after:-translate-y-1/2 peer-checked:after:-rotate-180 after:transition-transform inline-flex border border-gray-200 rounded-sm px-5 py-2">
        {prompt}
        {isJsEnabled && selectedOptions.length > 0 && (
          <span className="ml-1 text-blue-500">{`(${selectedOptions.length})`}</span>
        )}
      </div>

      <div className="absolute z-100 bg-white border border-gray-200 transition-opacity opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto w-full max-h-60 overflow-y-scroll">
        {isJsEnabled && (
          <ul>
            <li>
              <button
                onClick={handleSelectAllClick}
                disabled={!isSelectAllEnabled}
                className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50 cursor-pointer"
              >
                {"Select All"}
              </button>
            </li>
            <li>
              <button
                onClick={handleClearSelectionClick}
                disabled={!isClearSelectionEnabled}
                className="w-full text-left px-2 py-1 text-blue-600 disabled:opacity-50 cursor-pointer"
              >
                {"Clear selection"}
              </button>
            </li>
          </ul>
        )}
        <ul  ref={optionsListRef}>
          {options.map((option, i) => {
            return (
              <li key={option}>
                <label
                  className={`flex whitespace-nowrap cursor-pointer px-2 py-1 transition-colors hover:bg-blue-100 [&:has(input:checked)]:bg-blue-200`}
                >
                  <input
                    type="checkbox"
                    name={formFieldName}
                    value={option}
                    className="cursor-pointer"
                    onChange={handleChange}
                  />
                  <span className="ml-1">{option}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </label>
  );
}