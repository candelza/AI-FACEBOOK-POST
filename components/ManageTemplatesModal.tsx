import React from 'react';
import type { PromptTemplate } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { ResetIcon } from './icons/ResetIcon';

interface ManageTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: PromptTemplate[];
  onDelete: (value: string) => void;
  onReset: () => void;
}

export const ManageTemplatesModal: React.FC<ManageTemplatesModalProps> = ({ isOpen, onClose, templates, onDelete, onReset }) => {
  if (!isOpen) return null;

  // Filter out the placeholder template so it cannot be deleted
  const userTemplates = templates.filter(t => t.value !== '');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">จัดการเทมเพลต</h2>
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
        </div>
        
        <div className="px-6 pb-6 flex-1 overflow-y-auto space-y-3">
          {userTemplates.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">คุณยังไม่มีเทมเพลตที่บันทึกไว้</p>
          ) : (
            userTemplates.map((template, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{template.name}</span>
                <button
                  onClick={() => onDelete(template.value)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"
                  aria-label={`ลบเทมเพลต ${template.name}`}
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 shrink-0 flex justify-between items-center gap-4">
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 hover:underline"
          >
            <ResetIcon />
            <span>รีเซ็ตเป็นค่าเริ่มต้น</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-500 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
