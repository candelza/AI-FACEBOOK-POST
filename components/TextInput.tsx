
import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, ...props }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={props.id || props.name} className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        {...props}
      />
    </div>
  );
};
