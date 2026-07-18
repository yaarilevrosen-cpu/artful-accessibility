import React, { useState, useRef } from "react";
import InformationCircleIcon from "@heroicons/react/24/outline/InformationCircleIcon";

function CustomDropdown(props) {
    const {
        labelTitle,
        labelDescription,
        defaultValue,
        containerStyle,
        placeholder,
        labelStyle,
        options,
        updateType,
        updateFormValue,
        icon,
    } = props;

    const [value, setValue] = useState(defaultValue || "");
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleSelection = (selectedValue) => {
        updateFormValue({ updateType, value: selectedValue });
        setValue(selectedValue);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className={`relative ${containerStyle}`}>
            <label className={`label ${labelStyle}`}>
                <div className="label-text">
                    {labelTitle}
                    {labelDescription && (
                        <div className="tooltip tooltip-right" data-tip={labelDescription}>
                            <InformationCircleIcon className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </label>

            {/* Custom Dropdown */}
            <div
                ref={dropdownRef}
                className="relative w-full cursor-pointer"
                onClick={toggleDropdown}
            >
                <div className="flex items-center justify-between select select-bordered w-full  pr-6 bg-white border border-gray-300 rounded-md">
                    <div className="flex items-center">
                        {icon && <div className="mr-2">{icon}</div>}
                        <span>{value || placeholder}</span>
                    </div>
                </div>

                {isOpen && (
                    <ul className="absolute  mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                        {options.map((o, k) => (
                            <li
                                key={k}
                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                                    o.value === value ? "bg-gray-200" : ""
                                }`}
                                onClick={() => handleSelection(o.value || o.name)}
                            >
                                {o.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default CustomDropdown;
