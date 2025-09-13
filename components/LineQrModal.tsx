import React from 'react';

interface LineQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LineQrModal: React.FC<LineQrModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=https://line.me/ti/p/5KxC476XiY";
  const lineId = "@candelaz";

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 text-center">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">เพิ่มเพื่อนใน LINE</h2>
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
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
             <p className="text-sm">สแกน QR Code นี้เพื่อเพิ่มเพื่อน</p>
             <div className="flex justify-center p-2 bg-white rounded-lg">
                <img src={qrCodeUrl} alt="LINE QR Code" width="256" height="256" className="rounded-md" />
             </div>
             <div>
                <p className="text-sm">หรือเพิ่มด้วย ID</p>
                <a 
                  href="https://line.me/ti/p/5KxC476XiY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-lg tracking-wider bg-gray-100 dark:bg-gray-700 py-2 px-4 rounded-lg inline-block mt-1 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {lineId}
                </a>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};