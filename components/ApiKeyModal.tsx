import React from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">วิธีเชื่อมต่อ Google AI API Key</h2>
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
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <section>
              <h3 className="text-lg font-semibold mb-2 text-indigo-600 dark:text-indigo-400">ขั้นตอนการรับ API Key</h3>
              <div className="space-y-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                <div>
                  <ol className="list-decimal list-inside text-sm space-y-3 mt-1">
                    <li>
                      ไปที่ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-semibold">Google AI Studio</a> และลงชื่อเข้าใช้ด้วยบัญชี Google ของคุณ
                    </li>
                    <li>
                      คลิกที่ปุ่ม <strong>"Create API key"</strong>
                    </li>
                    <li>
                      ระบบจะสร้าง API Key ใหม่ให้คุณ คลิกที่ไอคอนคัดลอก (Copy) เพื่อคัดลอก Key ทั้งหมด
                    </li>
                    <li>
                        นำ Key ที่คัดลอกมาวางในช่อง "Google AI API Key" ในหน้านี้ แล้วคลิก "บันทึกและทดสอบการเชื่อมต่อ"
                    </li>
                  </ol>
                </div>
                <div>
                   <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md">
                        <strong>คำเตือน:</strong> API Key เปรียบเสมือนรหัสผ่าน ห้ามเปิดเผยให้ผู้อื่นทราบ และเก็บรักษาไว้ในที่ปลอดภัย
                   </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
