
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">วิธีเชื่อมต่อ Facebook & Instagram</h2>
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
              <div className="space-y-4 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                <div>
                  <h4 className="font-bold">วิธีหา Facebook Page ID:</h4>
                  <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                    <li>ไปที่หน้าเพจ Facebook ของคุณ</li>
                    <li>ในเมนูด้านซ้ายของเพจ คลิกที่แท็บ <strong>'เกี่ยวกับ' (About)</strong></li>
                    <li>เลื่อนลงมาด้านล่างสุด คุณจะเห็นส่วน <strong>'ความโปร่งใสของเพจ' (Page Transparency)</strong></li>
                    <li>ในส่วนนี้ คุณจะพบ <strong>Page ID</strong> ของคุณ ให้คัดลอกชุดตัวเลขทั้งหมด</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-bold">วิธีหา Facebook User Access Token:</h4>
                   <ol className="list-decimal list-inside text-sm space-y-2">
                      <li>ไปที่ <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Facebook Graph API Explorer</a></li>
                      <li>ในเมนูด้านขวาบน เลือกแอปพลิเคชันของคุณ</li>
                      <li>คลิกที่ 'Get Token' และเลือก 'Get User Access Token'</li>
                      <li>
                        <p className="font-semibold">เลือกสิทธิ์ที่จำเป็น (Add Permissions):</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ในหน้าต่าง Pop-up, คลิก "Add a Permission" และค้นหา/เลือกสิทธิ์ที่จำเป็น **ทั้งหมด** ดังนี้:</p>
                        <ul className="mt-2 space-y-2 list-none">
                            <li><code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm">pages_show_list</code></li>
                            <li><code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm">pages_read_engagement</code></li>
                            <li><code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm">instagram_basic</code> <span className="text-xs">(สำหรับเชื่อมต่อ IG)</span></li>
                            <li><code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm">instagram_content_publish</code> <span className="text-xs">(สำหรับโพสต์ IG)</span></li>
                            <li className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg border border-red-300 dark:border-red-700">
                                <code className="text-red-800 dark:text-red-200 font-bold text-sm">pages_manage_posts</code>
                                <p className="text-sm text-red-700 dark:text-red-300 mt-1"><strong>สำคัญ:</strong> สิทธิ์นี้จำเป็นสำหรับการโพสต์เนื้อหาลงเพจ</p>
                            </li>
                        </ul>
                      </li>
                      <li>คลิก 'Generate Access Token' และคัดลอก Token ที่ได้มา</li>
                   </ol>
                   <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30 p-2 rounded-md"><strong>หมายเหตุ:</strong> User Access Token ที่คุณสร้างขึ้นนี้ เมื่อได้รับสิทธิ์ที่ถูกต้องแล้ว จะสามารถใช้จัดการเพจของคุณได้เสมือนเป็น Page Access Token สำหรับแอปพลิเคชันนี้</p>
                   <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-md"><strong>คำเตือน:</strong> Access Token เปรียบเสมือนรหัสผ่าน ห้ามเปิดเผยให้ผู้อื่นทราบ แอปนี้ไม่ได้เก็บ Token ของคุณไว้</p>
                </div>
              </div>
            </section>

             <section>
              <h3 className="text-lg font-semibold mb-2 text-pink-600 dark:text-pink-400">การตั้งค่า Instagram (สำหรับโพสต์ข้ามแพลตฟอร์ม)</h3>
              <div className="space-y-4 pl-4 border-l-2 border-pink-200 dark:border-pink-800">
                <div>
                    <h4 className="font-bold">ข้อกำหนดเบื้องต้น:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-1">
                        <li>บัญชี Instagram ของคุณต้องเป็น <strong>บัญชีธุรกิจ (Business Account)</strong> หรือ <strong>บัญชีครีเอเตอร์ (Creator Account)</strong></li>
                        <li>บัญชี Instagram Business ต้องถูก<strong>เชื่อมต่อกับ Facebook Page</strong> ที่คุณต้องการจะโพสต์</li>
                    </ul>
                </div>
                <div>
                  <h4 className="font-bold">วิธีเชื่อมต่อ Instagram กับ Facebook Page:</h4>
                  <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                    <li>ไปที่หน้าเพจ Facebook ของคุณ</li>
                    <li>คลิก <strong>'การตั้งค่า' (Settings)</strong> > <strong>'บัญชีที่ลิงก์' (Linked Accounts)</strong></li>
                    <li>เลือก <strong>Instagram</strong> และคลิก <strong>'เชื่อมต่อบัญชี' (Connect Account)</strong></li>
                    <li>ทำตามขั้นตอนเพื่อลงชื่อเข้าใช้และอนุญาตการเชื่อมต่อ</li>
                    <li>หลังจากเชื่อมต่อสำเร็จแล้ว คุณจะสามารถใช้ปุ่ม "ดึงข้อมูลบัญชี Instagram" ในแอปนี้ได้</li>
                  </ol>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2 text-amber-600 dark:text-amber-400">การแก้ไขปัญหา (Troubleshooting)</h3>
              <div className="space-y-4 pl-4 border-l-2 border-amber-200 dark:border-amber-800">
                <div>
                  <h4 className="font-bold">ปัญหา: โพสต์สำเร็จ แต่ไม่แสดงเป็นสาธารณะ?</h4>
                  <p className="text-sm mt-1">
                    หากโพสต์ของคุณแสดงบนเพจ แต่มีข้อความกำกับว่า "เฉพาะผู้ที่จัดการเพจนี้เท่านั้นที่มองเห็น..." (Only people who manage this page can see...)
                    นั่นหมายความว่า <strong>Facebook App ของคุณยังอยู่ในโหมด "In development" (กำลังพัฒนา)</strong>
                  </p>
                  <p className="text-sm mt-2">
                    โพสต์ที่สร้างโดยแอปที่อยู่ในโหมดพัฒนานี้ จะมองเห็นได้เฉพาะผู้ที่มีบทบาทในแอป (เช่น Admins, Developers) เท่านั้น
                  </p>
                  <h5 className="font-semibold mt-3 text-sm">วิธีแก้ไข:</h5>
                  <ol className="list-decimal list-inside text-sm space-y-1 mt-1">
                    <li>ไปที่ <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">App Dashboard</a> ของ Facebook Developer</li>
                    <li>เลือกแอปพลิเคชันที่คุณใช้สร้าง Access Token</li>
                    <li>ที่ด้านบนสุดของหน้าจอ จะมีสวิตช์ <strong>App Mode</strong> ให้คุณเปลี่ยนจาก <strong>Development</strong> เป็น <strong>Live</strong></li>
                    <li>
                      Facebook อาจต้องการให้คุณกรอกข้อมูลเพิ่มเติม เช่น URL นโยบายความเป็นส่วนตัว (Privacy Policy URL) ก่อนที่จะอนุญาตให้แอปของคุณเข้าสู่โหมด Live ได้
                    </li>
                  </ol>
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30 p-2 rounded-md">
                  <strong>หลังจากเปลี่ยนแอปเป็นโหมด Live แล้ว โพสต์ใหม่ทั้งหมดที่สร้างจากแอปนี้จะแสดงเป็นสาธารณะตามปกติ</strong>
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
