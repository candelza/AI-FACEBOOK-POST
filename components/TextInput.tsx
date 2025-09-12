
import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const TextInput: React.FC<TextInputProps> = ({ label, description, endAdornment, className, ...props }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={props.id || props.name} className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {description && <div className="-mt-1 mb-2">{description}</div>}
      <div className="relative">
        <input
          id={props.id || props.name}
          className={`w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition ${className || ''}`}
          {...props}
        />
        {endAdornment && (
          <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center">
            {endAdornment}
          </div>
        )}
      </div>
    </div>
  );
};
