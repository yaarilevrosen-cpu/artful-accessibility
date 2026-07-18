import React, { useState } from 'react';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';


function SelectBox(props) {
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
        icon, // Add the icon prop
    } = props;

    const [value, setValue] = useState(defaultValue || "");

    const updateValue = (newValue) => {
        updateFormValue({ updateType, value: newValue });
        setValue(newValue);
    };

    return (
        <div className={`inline-block relative ${containerStyle}`}>
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

            {/* Select with Icon Inside */}
            <div className="relative w-full">
                <select
                    className="select select-bordered w-full appearance-none pl-10 pr-8"
                    value={value}
                    onChange={(e) => updateValue(e.target.value)}
                >
                    <option disabled value="PLACEHOLDER">{placeholder}</option>
                    {options.map((o, k) => (
                        <option value={o.value || o.name} key={k}>{o.name}</option>
                    ))}
                </select>

                {/* Icon Positioned Inside */}
                {icon && (
                    <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                       {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SelectBox;
