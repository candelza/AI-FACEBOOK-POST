

import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange, disabled, ...props }) => {
  return (
    <label className={`flex items-center justify-between w-full ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      {/* The label text */}
      <div className={`${disabled ? 'opacity-50' : ''}`}>
        {label}
      </div>

      {/* The actual toggle mechanism */}
      <div className="relative">
        {/* Hidden checkbox for accessibility and state management */}
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          {...props}
        />
        {/* The track of the toggle */}
        <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-offset-white dark:peer-focus:ring-offset-gray-800 peer-focus:ring-indigo-500 peer-checked:bg-indigo-600 transition-colors"></div>
        {/* The thumb of the toggle */}
        <div className="absolute left-1 top-1 bg-white border-gray-300 border rounded-full h-4 w-4 transition-transform peer-checked:translate-x-5 peer-checked:border-white"></div>
      </div>
    </label>
  );
};
