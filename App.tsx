import React, { useState, useCallback, useEffect } from 'react';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { TextInput } from './components/TextInput';
import { ImageUploader } from './components/ImageUploader';
import { PostPreview } from './components/PostPreview';
import { FacebookIcon } from './components/icons/FacebookIcon';
import { GoogleSheetsIcon } from './components/icons/GoogleSheetsIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { LogHistory } from './components/LogHistory';
import { InstructionsModal } from './components/InstructionsModal';
import { InfoIcon } from './components/icons/InfoIcon';
import type { UploadedImage, LogEntry } from './types';
import { generatePost } from './services/geminiService';
import { HistoryIcon } from './components/icons/HistoryIcon';

const promptTemplates = [
  { name: '— เลือกเทมเพลต หรือ พิมพ์ด้านล่าง —', value: '' },
  { name: 'โทนสนุกสนาน', value: 'เขียนแคปชั่นให้ดูสนุกสนาน, เป็นกันเอง, และใช้อิโมจิเยอะๆ เพื่อสร้างการมีส่วนร่วม' },
  { name: 'โทนมืออาชีพ', value: 'เขียนแคปชั่นด้วยภาษาที่เป็นทางการ, สุภาพ, และน่าเชื่อถือ เน้นการให้ข้อมูลที่ชัดเจน' },
  { name: 'ประกาศลดราคา', value: 'เขียนแคปชั่นเพื่อประกาศโปรโมชั่นลดราคา สร้างความรู้สึกเร่งด่วนและคุ้มค่า เชิญชวนให้รีบซื้อ' },
  { name: 'เปิดตัวสินค้าใหม่', value: 'เขียนแคปชั่นเปิดตัวสินค้าใหม่ให้น่าตื่นเต้น เน้นจุดเด่นที่ไม่เหมือนใคร และเชิญชวนให้เป็นเจ้าของคนแรก' },
  { name: 'สร้างการมีส่วนร่วม (คำถาม)', value: 'เขียนแคปชั่นในรูปแบบคำถามปลายเปิดเพื่อกระตุ้นให้ผู้ติดตามเข้ามาแสดงความคิดเห็น' },
];

const translateFacebookError = (error: { code: number; message: string }): string => {
  switch (error.code) {
    case 190:
      return 'Access Token ไม่ถูกต้องหรือหมดอายุ กรุณาตรวจสอบและสร้างใหม่จาก Facebook Developer Tools';
    case 200:
      if (error.message.toLowerCase().includes('permission')) {
        return 'ไม่มีสิทธิ์ (Permission) ในการโพสต์ไปยังเพจนี้ กรุณาตรวจสอบว่า Token ของคุณมีสิทธิ์ pages_manage_posts';
      }
      return `เกิดข้อผิดพลาดที่ไม่คาดคิดจาก Facebook (Code 200): ${error.message}`;
    case 803:
       return 'ไม่พบเพจที่ระบุ กรุณาตรวจสอบ Page ID อีกครั้ง';
    case 10:
       return 'มีการเรียกใช้งาน Facebook API มากเกินไป กรุณารอสักครู่แล้วลองใหม่';
    default:
      return `เกิดข้อผิดพลาดที่ไม่รู้จักจาก Facebook: ${error.message}`;
  }
};

const App: React.FC = () => {
  const [facebookPageId, setFacebookPageId] = useState<string>('');
  const [facebookUserToken, setFacebookUserToken] = useState<string>('');
  const [sheetData, setSheetData] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);
  
  const [logHistory, setLogHistory] = useState<LogEntry[]>([]);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('fbPostHistory');
      if (savedHistory) {
        setLogHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to parse data from localStorage", e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fbPostHistory', JSON.stringify(logHistory));
  }, [logHistory]);

  const handleDownloadExample = () => {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF"
      + "หัวข้อ,รายละเอียด\n"
      + "สินค้า,\"เสื้อยืดคอตตอน 100%\"\n"
      + "ราคา,\"590 บาท\"\n"
      + "โปรโมชั่น,\"ซื้อ 2 แถม 1 ถึงสิ้นเดือนนี้\"\n"
      + "กลุ่มเป้าหมาย,\"วัยรุ่น, นักศึกษา\"\n"
      + "จุดเด่น,\"ผ้านุ่ม ใส่สบาย มีให้เลือก 5 สี\"\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ตัวอย่างข้อมูล.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePost = useCallback(async () => {
    if (!sheetData || !uploadedImage) {
      setError('กรุณาใส่ข้อมูลจาก Google Sheets และอัปโหลดรูปภาพ');
      return;
    }
    if (!facebookPageId || !facebookUserToken) {
      setError('กรุณากรอก Facebook Page ID และ User Access Token');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPost('');
    setActivePostId(null);

    try {
      const postText = await generatePost(sheetData, uploadedImage, customPrompt);
      setGeneratedPost(postText);
      const newLogEntry: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        content: postText,
        imageUrl: uploadedImage.base64,
        status: 'Generated',
        pageId: facebookPageId,
      };
      setLogHistory(prev => [newLogEntry, ...prev]);
      setActivePostId(newLogEntry.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
    } finally {
      setIsLoading(false);
    }
  }, [sheetData, uploadedImage, customPrompt, facebookPageId, facebookUserToken]);

  const clearGeneratedPost = () => {
      setGeneratedPost('');
      setUploadedImage(null);
      setActivePostId(null);
      setScheduledTime('');
  }

  const handlePostToFacebook = useCallback(async (postId: string, postContent: string) => {
    // This is a simulation of a real Facebook API call.
    // It uses "magic strings" in the input fields to trigger specific, realistic error messages.
    console.log('Attempting to post to Facebook with:', {
      pageId: facebookPageId,
      token: '...', // Never log the real token
      message: postContent,
    });

    // Simulate API network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // --- Simulation Logic for Errors ---
    if (facebookUserToken.toLowerCase().includes('invalid_token')) {
        // Facebook API error structure
        throw { code: 190, message: 'Invalid OAuth access token.' };
    }
    if (facebookPageId.toLowerCase().includes('permission_denied')) {
        throw { code: 200, message: '(#200) Insufficient permission to post to target page.' };
    }
    if (!/^\d+$/.test(facebookPageId)) {
        throw { code: 803, message: '(#803) Some of the aliases you requested do not exist: ' + facebookPageId };
    }

    // --- Success Case ---
    setLogHistory(prev =>
      prev.map(entry =>
        entry.id === postId ? { ...entry, status: 'Posted' } : entry
      )
    );
  }, [facebookPageId, facebookUserToken]);

  const handlePostNow = async () => {
    if (!activePostId) return;

    setIsPosting(true);
    setError(null);
    setPostSuccess(null);

    try {
        await handlePostToFacebook(activePostId, generatedPost);
        setPostSuccess('โพสต์ของคุณถูกจำลองการโพสต์ลง Facebook เรียบร้อยแล้ว');
        setTimeout(() => setPostSuccess(null), 5000);
        clearGeneratedPost();
    } catch (err: any) {
        const errorMessage = err.code ? translateFacebookError(err) : (err.message || 'เกิดข้อผิดพลาดที่ไม่รู้จัก');
        setError(errorMessage);
         setLogHistory(prev =>
            prev.map(entry =>
                entry.id === activePostId ? { ...entry, status: 'Failed' } : entry
            )
        );
    } finally {
        setIsPosting(false);
    }
  };
  
  const handleSchedulePost = () => {
    if (!scheduledTime || !activePostId) return;

    const scheduleDate = new Date(scheduledTime);
    const now = new Date();

    if (scheduleDate <= now) {
      setError("กรุณาเลือกเวลาในอนาคต");
      return;
    }

    const delay = scheduleDate.getTime() - now.getTime();
    
    setLogHistory(prev =>
      prev.map(entry =>
        entry.id === activePostId
          ? { ...entry, status: 'Scheduled', scheduledTimestamp: scheduleDate.toISOString() }
          : entry
      )
    );
    
    const postContent = generatedPost; // Capture current post content
    const postId = activePostId;

    setTimeout(async () => {
      try {
        await handlePostToFacebook(postId, postContent);
      } catch (err: any) {
        const errorMessage = err.code ? translateFacebookError(err) : 'เกิดข้อผิดพลาดในการโพสต์ตามเวลา';
        setError(errorMessage);
        setLogHistory(prev =>
            prev.map(entry =>
                entry.id === postId ? { ...entry, status: 'Failed' } : entry
            )
        );
      }
    }, delay);

    setPostSuccess(`โพสต์ของคุณถูกตั้งเวลาแล้ว โปรดอย่าปิดแท็บนี้`);
    clearGeneratedPost();
  };

  const isGenerationDisabled = !sheetData || !uploadedImage || !facebookPageId || !facebookUserToken || isLoading;
  const isPostingDisabled = !generatedPost || isPosting;

  return (
    <>
      <InstructionsModal isOpen={isInstructionsOpen} onClose={() => setIsInstructionsOpen(false)} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
              ระบบสร้างโพสต์ Facebook อัตโนมัติด้วย AI
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
              สร้างและจัดการโพสต์ Facebook ของคุณได้อย่างง่ายดายด้วยพลังของ AI
            </p>
          </header>

          <main className="space-y-6">
             <div className="flex justify-center">
              <button 
                onClick={() => setIsInstructionsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition"
              >
                <InfoIcon />
                วิธีเชื่อมต่อ Facebook และ Google AI
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
                <p className="font-bold">เกิดข้อผิดพลาด</p>
                <p>{error}</p>
              </div>
            )}
            {postSuccess && (
              <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-lg">
                <p className="font-bold">สำเร็จ!</p>
                <p>{postSuccess}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="ขั้นตอนที่ 1: เชื่อมต่อบัญชี" icon={<FacebookIcon />}>
                <div className="space-y-4">
                  <TextInput
                    label="Facebook Page ID"
                    value={facebookPageId}
                    onChange={(e) => setFacebookPageId(e.target.value)}
                    placeholder="เช่น 123456789012345"
                  />
                  <TextInput
                    label="Facebook User Access Token"
                    type="password"
                    value={facebookUserToken}
                    onChange={(e) => setFacebookUserToken(e.target.value)}
                    placeholder="วาง Access Token ของคุณที่นี่"
                  />
                </div>
              </Card>

              <Card title="ขั้นตอนที่ 2: เตรียมเนื้อหา" icon={<GoogleSheetsIcon />}>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="sheet-data" className="font-semibold text-gray-700 dark:text-gray-300">
                        วางข้อมูลจาก Google Sheet
                      </label>
                      <button onClick={handleDownloadExample} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                        ดาวน์โหลดตัวอย่าง
                      </button>
                    </div>
                    <textarea
                      id="sheet-data"
                      rows={4}
                      value={sheetData}
                      onChange={(e) => setSheetData(e.target.value)}
                      placeholder="ตัวอย่าง:&#10;สินค้า: เสื้อยืด&#10;ราคา: 590 บาท&#10;โปรโมชั่น: ลด 20%"
                      className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                  <ImageUploader key={activePostId} onImageUpload={setUploadedImage} />
                </div>
              </Card>
            </div>
            
            <Card title="ขั้นตอนที่ 3: สร้างโพสต์ด้วย AI" icon={<SparklesIcon />}>
              <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="prompt-template" className="font-semibold text-gray-700 dark:text-gray-300">
                      คำสั่งสำหรับ AI
                    </label>
                    <select
                      id="prompt-template"
                      value={promptTemplates.find(t => t.value === customPrompt)?.value ?? ''}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                      {promptTemplates.map((template) => (
                        <option key={template.name} value={template.value}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    <textarea
                      id="custom-prompt"
                      rows={3}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="เลือกเทมเพลต หรือพิมพ์คำสั่งของคุณที่นี่..."
                      className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                  <Button onClick={handleGeneratePost} disabled={isGenerationDisabled} isLoading={isLoading}>
                    {isLoading ? 'กำลังสร้าง...' : 'สร้างโพสต์'}
                  </Button>
              </div>
            </Card>

            {generatedPost && uploadedImage && activePostId && (
              <Card title="ขั้นตอนที่ 4: ตัวอย่างและโพสต์">
                <div className="space-y-4">
                  <PostPreview
                    pageId={facebookPageId}
                    content={generatedPost}
                    imageUrl={uploadedImage.base64}
                  />
                  <textarea
                    value={generatedPost}
                    onChange={(e) => setGeneratedPost(e.target.value)}
                    rows={5}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition mt-2"
                    aria-label="แก้ไขโพสต์ที่สร้างขึ้น"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div>
                      <label htmlFor="schedule-time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ตั้งเวลาโพสต์</label>
                      <input
                        type="datetime-local"
                        id="schedule-time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 transition"
                      />
                      <Button onClick={handleSchedulePost} disabled={!scheduledTime || isPosting} isLoading={isPosting && !!scheduledTime} className="mt-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600">
                        {isPosting && !!scheduledTime ? 'กำลังตั้งเวลา...' : 'ยืนยันการตั้งเวลา'}
                      </Button>
                    </div>
                    <Button onClick={handlePostNow} disabled={isPostingDisabled} isLoading={isPosting && !scheduledTime} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 h-[42px] self-end">
                      {isPosting && !scheduledTime ? 'กำลังโพสต์...' : 'โพสต์ทันที'}
                    </Button>
                  </div>
                  <p className="text-xs text-center text-amber-600 dark:text-amber-400 mt-2">
                      <strong>ข้อสำคัญ:</strong> การตั้งเวลาโพสต์จะทำงานบนเบราว์เซอร์เท่านั้น กรุณาอย่าปิดแท็บนี้จนกว่าจะถึงเวลาโพสต์
                    </p>
                </div>
              </Card>
            )}

            <LogHistory logs={logHistory} />
          </main>
        </div>
      </div>
    </>
  );
};

export default App;