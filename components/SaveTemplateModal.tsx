import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { TextInput } from './TextInput';
import { SaveIcon } from './icons/SaveIcon';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  currentPromptValue: string;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ isOpen, onClose, onSave, currentPromptValue }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(name);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center pb-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <SaveIcon />
                <span className="ml-2">บันทึกเทมเพลต</span>
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
             <div className="space-y-2">
                <p className="font-semibold text-gray-700 dark:text-gray-300">เนื้อหาที่จะบันทึก:</p>
                <p className="text-sm p-3 bg-gray-100 dark:bg-gray-700/50 rounded-md max-h-24 overflow-y-auto border border-gray-200 dark:border-gray-600">
                    {currentPromptValue}
                </p>
             </div>
             <TextInput 
                label="ตั้งชื่อเทมเพลต"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น โทนสำหรับโปร 12.12"
             />
             <div className="flex gap-4">
                <button
                    onClick={onClose}
                    className="w-full text-center px-6 py-3 border border-gray-300 dark:border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                    ยกเลิก
                </button>
                <Button onClick={handleSave} disabled={!name.trim()}>
                    บันทึก
                </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
