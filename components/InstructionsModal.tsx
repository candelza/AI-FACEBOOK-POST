import React from 'react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">วิธีเชื่อมต่อ Facebook</h2>
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
              <h3 className="text-lg font-semibold mb-2 text-indigo-600 dark:text-indigo-400">การตั้งค่า Facebook</h3>
              <div className="space-y-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                <div>
                  <h4 className="font-bold">วิธีหา Facebook Page ID:</h4>
                  <p className="text-sm">ไปที่เพจ Facebook ของคุณ &gt; คลิกที่แท็บ 'เกี่ยวกับ' (About) &gt; เลื่อนลงมาที่ 'ข้อมูลเพจ' (Page Transparency) &gt; คุณจะพบ Page ID ของคุณที่นั่น</p>
                </div>
                <div>
                  <h4 className="font-bold">วิธีหา Facebook User Access Token:</h4>
                   <ol className="list-decimal list-inside text-sm space-y-1">
                      <li>ไปที่ <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Facebook Graph API Explorer</a></li>
                      <li>ในเมนูด้านขวาบน เลือกแอปพลิเคชันของคุณ</li>
                      <li>คลิกที่ 'Get Token' และเลือก 'Get User Access Token'</li>
                      <li>เลือกสิทธิ์ (Permissions) ที่จำเป็น เช่น <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">pages_show_list</code>, <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">pages_read_engagement</code>, <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">pages_manage_posts</code></li>
                      <li>คลิก 'Generate Access Token' และคัดลอก Token ที่ได้มา</li>
                   </ol>
                   <p className="mt-2 text-xs text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded-md"><strong>คำเตือน:</strong> Access Token เปรียบเสมือนรหัสผ่าน ห้ามเปิดเผยให้ผู้อื่นทราบ แอปนี้เป็นเพียงตัวอย่างและไม่ได้เก็บ Token ของคุณไว้</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};