
import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, disabled, ...props }) => {
  return (
    <label className={`flex items-center space-x-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        className="form-checkbox h-5 w-5 text-indigo-600 dark:text-indigo-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:ring-offset-0 transition duration-150 ease-in-out disabled:opacity-50"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <span className={`font-medium ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
        {label}
      </span>
    </label>
  );
};
