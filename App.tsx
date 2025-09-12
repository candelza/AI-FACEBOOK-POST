
import React, { useState, useCallback, useEffect } from 'react';
import { Card } from './components/Card';
import { Button } from './components/Button';
import { TextInput } from './components/TextInput';
import { ImageUploader } from './components/ImageUploader';
import { PostPreview } from './components/PostPreview';
import { FacebookIcon } from './components/icons/FacebookIcon';
import { InstagramIcon } from './components/icons/InstagramIcon';
import { GoogleSheetsIcon } from './components/icons/GoogleSheetsIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { LogHistory } from './components/LogHistory';
import { InstructionsModal } from './components/InstructionsModal';
import { InfoIcon } from './components/icons/InfoIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import { Checkbox } from './components/Checkbox';
import type { UploadedImage, LogEntry } from './types';
import { generatePost, generateImage, generateVideo } from './services/geminiService';

const promptTemplates = [
  { name: '— เลือกเทมเพลต หรือ พิมพ์ด้านล่าง —', value: '' },
  { name: 'โทนสนุกสนาน', value: 'เขียนแคปชั่นให้ดูสนุกสนาน, เป็นกันเอง, และใช้อิโมจิเยอะๆ เพื่อสร้างการมีส่วนร่วม' },
  { name: 'โทนมืออาชีพ', value: 'เขียนแคปชั่นด้วยภาษาที่เป็นทางการ, สุภาพ, และน่าเชื่อถือ เน้นการให้ข้อมูลที่ชัดเจน' },
  { name: 'โทนขำขัน/ติดตลก', value: 'เขียนแคปชั่นให้อ่านแล้วอมยิ้ม มีมุกตลกเล็กน้อย ไม่เป็นทางการจนเกินไป' },
  { name: 'โทนให้ความรู้', value: 'เขียนแคปชั่นที่เน้นให้ความรู้หรือข้อมูลที่เป็นประโยชน์เกี่ยวกับสินค้า/บริการ สร้างภาพลักษณ์ของผู้เชี่ยวชาญ' },
  { name: 'ประกาศลดราคา (เร่งด่วน)', value: 'เขียนแคปชั่นเพื่อประกาศโปรโมชั่นลดราคา สร้างความรู้สึกเร่งด่วนและคุ้มค่า ใช้คำว่า "ด่วน", "จำนวนจำกัด" เชิญชวนให้รีบซื้อ' },
  { name: 'เปิดตัวสินค้าใหม่', value: 'เขียนแคปชั่นเปิดตัวสินค้าใหม่ให้น่าตื่นเต้น เน้นจุดเด่นที่ไม่เหมือนใคร และเชิญชวนให้เป็นเจ้าของคนแรก' },
  { name: 'โปรโมทกิจกรรม/ไลฟ์สด', value: 'เขียนแคปชั่นสำหรับโปรโมทกิจกรรม/อีเวนต์/ไลฟ์สด บอกรายละเอียดวัน-เวลา สถานที่ และสิ่งที่น่าสนใจในงาน' },
  { name: 'สร้างการมีส่วนร่วม (คำถาม)', value: 'เขียนแคปชั่นในรูปแบบคำถามปลายเปิดเพื่อกระตุ้นให้ผู้ติดตามเข้ามาแสดงความคิดเห็น' },
  { name: 'สร้างการมีส่วนร่วม (Q&A)', value: 'เขียนแคปชั่นในรูปแบบ "ถาม-ตอบ" หรือเชิญชวนให้คนมาถามคำถามที่สงสัยเกี่ยวกับสินค้าหรือแบรนด์' },
  { name: 'เรื่องราวเบื้องหลัง (BTS)', value: 'เขียนแคปชั่นเล่าเรื่องราวเบื้องหลังการทำงาน, การผลิต หรือที่มาของสินค้า เพื่อสร้างความเชื่อมโยงกับลูกค้า' },
  { name: 'รีวิวจากลูกค้า (Testimonial)', value: 'เขียนแคปชั่นโดยอ้างอิงจากรีวิวของลูกค้า เน้นสร้างความน่าเชื่อถือจากผู้ใช้งานจริง' },
  { name: 'ประกาศสำคัญ (ทางการ)', value: 'เขียนประกาศในรูปแบบที่เป็นทางการ เหมาะสำหรับแจ้งข่าวสำคัญ เช่น การเปลี่ยนแปลงนโยบาย, การเปิดสาขาใหม่ หรือข่าวสารจากองค์กร' },
  { name: 'ชวนคุยแบบเป็นกันเอง', value: 'เขียนแคปชั่นเพื่อเริ่มต้นบทสนทนาแบบสบายๆ ไม่เน้นขายของ ถามคำถามง่ายๆ ที่เกี่ยวกับไลฟ์สตอรี่หรือความชอบ เพื่อสร้างความสัมพันธ์กับผู้ติดตาม' },
  { name: 'เน้นประโยชน์ที่ลูกค้าจะได้รับ', value: 'เขียนแคปชั่นโดยเน้นที่คุณประโยชน์ (Benefit) ของสินค้า ไม่ใช่แค่คุณสมบัติ (Feature) อธิบายว่าสินค้าจะช่วยแก้ปัญหาหรือทำให้ชีวิตของลูกค้าดีขึ้นได้อย่างไร' },
  { name: 'เรื่องเล่าจากทีมงาน', value: 'เขียนแคปชั่นในรูปแบบการเล่าเรื่อง แนะนำสมาชิกในทีม หรือเล่าถึงความท้าทายและความสำเร็จในการทำงาน เพื่อสร้างภาพลักษณ์ที่เข้าถึงง่ายและเป็นมนุษย์ให้กับแบรนด์' },
];

const translateFacebookError = (error: any): string => {
  if (!error) {
    return 'เกิดข้อผิดพลาดที่ไม่รู้จักจาก Facebook';
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  // Check for a nested 'error' object, which is common in Graph API responses,
  // or use the object itself if it's the top-level error.
  const apiError = error.error || error;

  // Now, check if the processed error object has a message.
  if (apiError.message && typeof apiError.message === 'string') {
    const messageString = apiError.message;
    const message = messageString.toLowerCase();

    switch (apiError.code) {
      case 190: // Invalid or expired token
        return 'Access Token หมดอายุ: ระบบได้ตัดการเชื่อมต่ออัตโนมัติ กรุณาสร้าง Access Token ใหม่จาก "Facebook Developer Tools" และทำการเชื่อมต่ออีกครั้ง';
      
      case 200: // Permissions error
        if (message.includes('permission') || message.includes('permissions')) {
          return 'โพสต์ไม่สำเร็จ: Access Token ไม่มีสิทธิ์ที่จำเป็น (เช่น pages_manage_posts) กรุณาคลิกปุ่ม "วิธีเชื่อมต่อ Facebook" เพื่อดูวิธีแก้ไขโดยละเอียด';
        }
        return `เกิดข้อผิดพลาดในการดำเนินการจาก Facebook (Code 200): ${messageString}`;

      case 803: // Page not found
        return 'ไม่พบเพจที่ระบุ: Page ID ที่คุณกรอกไม่ถูกต้องหรือไม่ตรงกับเพจใดๆ กรุณาตรวจสอบ Page ID ของคุณในหน้า "About" หรือ "Page Transparency" ของเพจอีกครั้ง';

      case 10: // API limit
        return 'เรียกใช้งานมากเกินไป: คุณได้พยายามเชื่อมต่อหรือโพสต์บ่อยเกินไป กรุณารอสักครู่ (ประมาณ 5-10 นาที) แล้วลองใหม่อีกครั้ง';

      default:
        let errorMessage = 'เกิดข้อผิดพลาดจาก Facebook';
        if (apiError.code) {
            errorMessage += ` (Code ${apiError.code})`;
        }
        if (apiError.error_subcode) {
            errorMessage += ` (Subcode ${apiError.error_subcode})`;
        }
        return `${errorMessage}: ${messageString}`;
    }
  }

  // Fallback for unknown object shapes
  try {
    const stringifiedError = JSON.stringify(error);
    if (stringifiedError === '{}') {
       return 'เกิดข้อผิดพลาดที่ไม่รู้จัก (ได้รับอ็อบเจกต์เปล่าจาก API)';
    }
    return `ได้รับข้อผิดพลาดในรูปแบบที่ไม่รู้จัก: ${stringifiedError}`;
  } catch (e) {
    return 'เกิดข้อผิดพลาดที่ไม่สามารถแสดงรายละเอียดได้';
  }
};


const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Invalid data URL');
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

const generateThumbnail = (base64: string, mediaType: 'image' | 'video'): Promise<string> => {
    return new Promise((resolve, reject) => {
        const MAX_WIDTH = 128;
        const MAX_HEIGHT = 128;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Could not get canvas context'));

        const element = mediaType === 'image' ? new Image() : document.createElement('video');

        const process = () => {
            const isImage = mediaType === 'image';
            const naturalWidth = isImage ? (element as HTMLImageElement).naturalWidth : (element as HTMLVideoElement).videoWidth;
            const naturalHeight = isImage ? (element as HTMLImageElement).naturalHeight : (element as HTMLVideoElement).videoHeight;
            
            let width = naturalWidth;
            let height = naturalHeight;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(element as CanvasImageSource, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7)); // Use JPEG for smaller size
        };

        if (mediaType === 'image') {
            (element as HTMLImageElement).onload = process;
        } else {
            const videoElement = element as HTMLVideoElement;
            videoElement.onloadeddata = () => {
                videoElement.currentTime = 0; // Seek to a specific frame, e.g., the first one
            };
            videoElement.onseeked = process;
        }
        
        element.onerror = reject;
        element.src = base64;
    });
};


export const App: React.FC = () => {
  const [facebookPageId, setFacebookPageId] = useState<string>('');
  const [facebookUserToken, setFacebookUserToken] = useState<string>('');
  const [instagramAccountId, setInstagramAccountId] = useState<string>('');
  
  const [sheetData, setSheetData] = useState<string>('');
  const [shopeeLink, setShopeeLink] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [postPrivacy, setPostPrivacy] = useState<'published' | 'unpublished'>('published');
  
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(400);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);
  
  const [logHistory, setLogHistory] = useState<LogEntry[]>([]);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState<boolean>(false);

  // Connection State
  const [fbConnectionStatus, setFbConnectionStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [fbConnectionMessage, setFbConnectionMessage] = useState<string>('');
  const [pageName, setPageName] = useState<string>('');
  
  const [igConnectionStatus, setIgConnectionStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [igConnectionMessage, setIgConnectionMessage] = useState<string>('');
  const [postToInstagram, setPostToInstagram] = useState<boolean>(false);

  // Media Generation State
  const [imageSourceTab, setImageSourceTab] = useState<'upload' | 'generateImage' | 'generateVideo'>('upload');
  const [imageGenerationPrompt, setImageGenerationPrompt] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [videoGenerationPrompt, setVideoGenerationPrompt] = useState<string>('');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [videoGenerationStatusMessage, setVideoGenerationStatusMessage] = useState<string | null>(null);


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
    if (logHistory.length === 0) return;
    try {
      const historyToSave = logHistory.length > 50 ? logHistory.slice(0, 50) : logHistory;
      localStorage.setItem('fbPostHistory', JSON.stringify(historyToSave));
    } catch (e) {
       console.error("Could not save history to localStorage. It might be full.", e);
    }
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
  
  const clearNotifications = () => {
    setError(null);
    setPostSuccess(null);
  }

  const verifyFacebookConnection = async () => {
    if (!facebookPageId || !facebookUserToken) {
      setFbConnectionStatus('error');
      setFbConnectionMessage('กรุณากรอก Page ID และ User Access Token');
      return;
    }
    setFbConnectionStatus('verifying');
    setFbConnectionMessage('กำลังตรวจสอบการเชื่อมต่อ...');
    try {
      const response = await fetch(`https://graph.facebook.com/v20.0/${facebookPageId}?fields=name&access_token=${facebookUserToken}`);
      const data = await response.json();
      if (!response.ok) {
        throw data.error;
      }
      setPageName(data.name);
      setFbConnectionStatus('success');
      setFbConnectionMessage(`เชื่อมต่อสำเร็จกับเพจ: ${data.name}`);
    } catch (err: any) {
      setFbConnectionStatus('error');
      setFbConnectionMessage(`เชื่อมต่อล้มเหลว: ${translateFacebookError(err)}`);
    }
  };
  
  const verifyInstagramConnection = async () => {
    if (fbConnectionStatus !== 'success') {
      setIgConnectionStatus('error');
      setIgConnectionMessage('กรุณาเชื่อมต่อ Facebook Page ให้สำเร็จก่อน');
      return;
    }
    setIgConnectionStatus('verifying');
    setIgConnectionMessage('กำลังดึงข้อมูลบัญชี Instagram...');
    try {
        const response = await fetch(`https://graph.facebook.com/v20.0/${facebookPageId}?fields=instagram_business_account{id,username}&access_token=${facebookUserToken}`);
        const data = await response.json();
        if (!response.ok) throw data.error;
        if (!data.instagram_business_account) {
          throw new Error("ไม่พบบัญชี Instagram Business ที่เชื่อมต่อกับเพจนี้");
        }
        setInstagramAccountId(data.instagram_business_account.id);
        setIgConnectionStatus('success');
        setIgConnectionMessage(`เชื่อมต่อสำเร็จกับ IG: ${data.instagram_business_account.username}`);
    } catch (err: any) {
        setIgConnectionStatus('error');
        setIgConnectionMessage(`เชื่อมต่อ IG ล้มเหลว: ${err.message || translateFacebookError(err)}`);
    }
  };

  const handleGeneratePost = async () => {
    if (!sheetData || !uploadedImage) {
      setError("กรุณากรอกข้อมูลสินค้าและอัปโหลดรูปภาพก่อน");
      return;
    }
    setIsLoading(true);
    clearNotifications();
    
    try {
      const caption = await generatePost(sheetData, uploadedImage, customPrompt, temperature, maxTokens);
      
      let finalPost = caption.trim();
      const trimmedLink = shopeeLink.trim();
      if (trimmedLink) {
        // Ensure the link has a protocol for better clickability on platforms.
        const fullLink = !(trimmedLink.startsWith('http://') || trimmedLink.startsWith('https://'))
          ? `https://${trimmedLink}`
          : trimmedLink;
        finalPost = `${finalPost}\n\n🛒 สั่งซื้อเลย: ${fullLink}`;
      }
      
      setGeneratedPost(finalPost);
      
      const thumbnailUrl = await generateThumbnail(uploadedImage.base64, uploadedImage.mediaType);
      const newLog: LogEntry = {
        id: `post_${Date.now()}`,
        timestamp: new Date().toISOString(),
        content: finalPost,
        thumbnailUrl,
        mediaType: uploadedImage.mediaType,
        status: 'Generated',
        pageId: facebookPageId,
      };
      setLogHistory(prev => [newLog, ...prev]);
      setActivePostId(newLog.id);

    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการสร้างโพสต์");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImageFromPrompt = async () => {
    if (!imageGenerationPrompt) {
      setError("กรุณาใส่คำสั่งสำหรับสร้างรูปภาพ");
      return;
    }
    setIsGeneratingImage(true);
    clearNotifications();
    setUploadedImage(null);
    try {
      const { base64, mimeType } = await generateImage(imageGenerationPrompt);
      setUploadedImage({
        base64,
        mimeType,
        mediaType: 'image'
      });
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการสร้างรูปภาพ");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoGenerationPrompt) {
        setError("กรุณาใส่คำสั่งสำหรับสร้างวิดีโอ");
        return;
    }
    setIsGeneratingVideo(true);
    clearNotifications();
    setUploadedImage(null);
    try {
        const { base64, mimeType } = await generateVideo(
            videoGenerationPrompt,
            videoAspectRatio,
            (message: string) => setVideoGenerationStatusMessage(message)
        );
        setUploadedImage({
            base64,
            mimeType,
            mediaType: 'video'
        });
    } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการสร้างวิดีโอ");
    } finally {
        setIsGeneratingVideo(false);
        setVideoGenerationStatusMessage(null);
    }
  };

const handlePublish = async () => {
    if (!generatedPost || !uploadedImage || !activePostId) {
        setError("กรุณาสร้างโพสต์ก่อน");
        return;
    }
    if (fbConnectionStatus !== 'success') {
        setError("กรุณาเชื่อมต่อกับ Facebook ให้สำเร็จก่อน");
        return;
    }
    if (postToInstagram && igConnectionStatus !== 'success') {
        setError("กรุณาเชื่อมต่อกับ Instagram ให้สำเร็จก่อน");
        return;
    }

    setIsPosting(true);
    clearNotifications();

    let pageAccessToken = '';

    try {
        // Step 1: Get Page Access Token
        const pageTokenResponse = await fetch(`https://graph.facebook.com/v20.0/${facebookPageId}?fields=access_token&access_token=${facebookUserToken}`);
        const pageTokenData = await pageTokenResponse.json();
        if (!pageTokenResponse.ok) throw (pageTokenData.error || pageTokenData);
        pageAccessToken = pageTokenData.access_token;
        
        // Step 2: Post to Facebook
        const postEndpoint = uploadedImage.mediaType === 'video'
            ? `https://graph-video.facebook.com/v20.0/${facebookPageId}/videos`
            : `https://graph.facebook.com/v20.0/${facebookPageId}/photos`;

        const fbFormData = new FormData();
        fbFormData.append('access_token', pageAccessToken);
        if (uploadedImage.mediaType === 'video') {
            fbFormData.append('description', generatedPost);
        } else {
            fbFormData.append('message', generatedPost);
        }
        const blob = dataURLtoBlob(uploadedImage.base64);
        fbFormData.append('source', blob, uploadedImage.file?.name || (uploadedImage.mediaType === 'video' ? 'video.mp4' : 'image.png'));

        const isScheduled = !!scheduledTime;
        if (isScheduled) {
            const scheduledTimestamp = Math.floor(new Date(scheduledTime).getTime() / 1000);
            fbFormData.append('scheduled_publish_time', String(scheduledTimestamp));
            fbFormData.append('published', 'false');
        } else {
            if (postPrivacy === 'unpublished') {
                fbFormData.append('published', 'false');
                fbFormData.append('unpublished_content_type', 'SCHEDULED');
            } else {
                fbFormData.append('published', 'true');
            }
        }
        
        const fbPostResponse = await fetch(postEndpoint, { method: 'POST', body: fbFormData });
        const fbPostData = await fbPostResponse.json();
        if (!fbPostResponse.ok) throw (fbPostData.error || fbPostData);

        let successMessageText = 'Facebook';

        // Step 3: Post to Instagram (if requested)
        if (postToInstagram) {
            try {
                if (!instagramAccountId) throw new Error("Instagram Account ID is not set.");
                
                // 3a: Get media URL from the FB post
                const mediaId = fbPostData.id;
                let mediaUrl = '';
                if (uploadedImage.mediaType === 'image') {
                    const imageInfoRes = await fetch(`https://graph.facebook.com/v20.0/${mediaId}?fields=images&access_token=${pageAccessToken}`);
                    const imageInfoData = await imageInfoRes.json();
                    if (!imageInfoRes.ok) throw (imageInfoData.error || imageInfoData);
                    if (imageInfoData.images && imageInfoData.images.length > 0) mediaUrl = imageInfoData.images[0].source;
                } else { // Video
                    const videoInfoRes = await fetch(`https://graph.facebook.com/v20.0/${mediaId}?fields=source&access_token=${pageAccessToken}`);
                    const videoInfoData = await videoInfoRes.json();
                    if (!videoInfoRes.ok) throw (videoInfoData.error || videoInfoData);
                    mediaUrl = videoInfoData.source;
                }
                if (!mediaUrl) throw new Error("Could not retrieve media URL from Facebook to post to Instagram.");

                // 3b: Create IG Media Container
                const containerParams = new URLSearchParams({ access_token: pageAccessToken, caption: generatedPost });
                if (uploadedImage.mediaType === 'image') {
                    containerParams.append('image_url', mediaUrl);
                } else {
                    containerParams.append('media_type', 'VIDEO');
                    containerParams.append('video_url', mediaUrl);
                }
                const containerRes = await fetch(`https://graph.facebook.com/v20.0/${instagramAccountId}/media`, { method: 'POST', body: containerParams });
                const containerData = await containerRes.json();
                if (!containerRes.ok) throw (containerData.error || containerData);
                const creationId = containerData.id;

                // 3c: Poll for container status
                let containerStatus = '';
                let attempts = 0;
                while(containerStatus !== 'FINISHED' && attempts < 24) { // Timeout after 2 minutes
                     await new Promise(resolve => setTimeout(resolve, 5000));
                     const statusRes = await fetch(`https://graph.facebook.com/v20.0/${creationId}?fields=status_code&access_token=${pageAccessToken}`);
                     const statusData = await statusRes.json();
                     if (!statusRes.ok) throw (statusData.error || statusData);
                     containerStatus = statusData.status_code;
                     if(containerStatus === 'ERROR') throw new Error(`Instagram media container failed with status: ${statusData.status || 'Unknown'}`);
                     attempts++;
                }
                if (containerStatus !== 'FINISHED') throw new Error("Instagram media container processing timed out.");
                
                // 3d: Publish container
                const publishRes = await fetch(`https://graph.facebook.com/v20.0/${instagramAccountId}/media_publish`, {
                    method: 'POST',
                    body: new URLSearchParams({ access_token: pageAccessToken, creation_id: creationId })
                });
                const publishData = await publishRes.json();
                if (!publishRes.ok) throw (publishData.error || publishData);

                successMessageText = "Facebook และ Instagram";

            } catch (igError: any) {
                console.error("Failed to post to Instagram:", igError);
                const igErrorMessage = translateFacebookError(igError);
                successMessageText = `Facebook (แต่โพสต์ลง Instagram ล้มเหลว: ${igErrorMessage})`;
            }
        }

        const finalSuccessMessage = isScheduled
            ? `ตั้งเวลาโพสต์ลง ${successMessageText} สำเร็จแล้ว`
            : (postPrivacy === 'unpublished' ? `โพสต์แบบไม่แสดงบนฟีดลง ${successMessageText} สำเร็จ` : `โพสต์ลง ${successMessageText} สำเร็จแล้ว!`);
        setPostSuccess(finalSuccessMessage);

        setLogHistory(prev => prev.map(log => log.id === activePostId ? {
            ...log,
            status: isScheduled ? 'Scheduled' : 'Posted',
            scheduledTimestamp: isScheduled ? new Date(scheduledTime).toISOString() : undefined,
            facebookPostId: fbPostData.id,
            privacy: postPrivacy,
        } : log));
        setActivePostId(null);
        setGeneratedPost('');

    } catch (err: any) {
        console.error("Publishing error:", err);
        setError(translateFacebookError(err));
        setLogHistory(prev => prev.map(log => log.id === activePostId ? {...log, status: 'Failed'} : log));
    } finally {
        setIsPosting(false);
    }
  };

  const handlePublishNow = async (logId: string, facebookPostId: string) => {
    if (!facebookPageId || !facebookUserToken) {
      setError("ข้อมูลการเชื่อมต่อ Facebook ไม่ครบถ้วน");
      return;
    }
    try {
      const pageTokenResponse = await fetch(`https://graph.facebook.com/v20.0/${facebookPageId}?fields=access_token&access_token=${facebookUserToken}`);
      const pageTokenData = await pageTokenResponse.json();
      if (!pageTokenResponse.ok) throw pageTokenData.error;
      const pageAccessToken = pageTokenData.access_token;

      const response = await fetch(`https://graph.facebook.com/v20.0/${facebookPostId}`, {
          method: 'POST',
          body: new URLSearchParams({ is_published: 'true', access_token: pageAccessToken })
      });
      const data = await response.json();
      if (!response.ok) throw data.error;
      
      setLogHistory(prev => prev.map(log => log.id === logId ? {...log, privacy: 'published'} : log));
      setPostSuccess("เผยแพร่โพสต์บนฟีดสำเร็จแล้ว!");
    } catch (err: any) {
      console.error("Error publishing post:", err);
      setError(translateFacebookError(err));
    }
  };

  const isPostButtonDisabled = !generatedPost || !activePostId || isPosting || fbConnectionStatus !== 'success';


  return (
    <>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">AI Facebook Post Automator</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">สร้างและโพสต์คอนเทนต์ลง Facebook และ Instagram ด้วยพลังของ AI</p>
        </header>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6" role="alert">
            <p className="font-bold">เกิดข้อผิดพลาด</p>
            <p>{error}</p>
          </div>
        )}
        {postSuccess && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md mb-6" role="alert">
            <p className="font-bold">สำเร็จ</p>
            <p>{postSuccess}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <Card title="1. เชื่อมต่อ Social Media" icon={<FacebookIcon />}>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Facebook Page</h3>
                <TextInput label="Facebook Page ID" value={facebookPageId} onChange={e => setFacebookPageId(e.target.value)} placeholder="e.g., 123456789012345" />
                <TextInput label="Facebook User Access Token" type="password" value={facebookUserToken} onChange={e => setFacebookUserToken(e.target.value)} placeholder="วาง Access Token ที่คัดลอกมาที่นี่" />

                <div className="flex items-center">
                   <Button onClick={verifyFacebookConnection} isLoading={fbConnectionStatus === 'verifying'}>
                    {fbConnectionStatus === 'success' ? 'เชื่อมต่อแล้ว' : 'ตรวจสอบการเชื่อมต่อ'}
                   </Button>
                   <button onClick={() => setIsInstructionsOpen(true)} className="ml-3 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center">
                    <InfoIcon />
                    <span className="ml-1 text-sm font-medium">วิธีเชื่อมต่อ</span>
                  </button>
                </div>
                {fbConnectionMessage && (
                  <p className={`text-sm mt-2 ${fbConnectionStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>{fbConnectionMessage}</p>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center"><InstagramIcon /> <span className="ml-2">Instagram Business (ไม่บังคับ)</span></h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">ต้องเชื่อมต่อ Facebook Page ก่อน และต้องเป็นบัญชี Instagram Business ที่ผูกกับเพจนั้น</p>
                  <Button onClick={verifyInstagramConnection} isLoading={igConnectionStatus === 'verifying'} disabled={fbConnectionStatus !== 'success'}>
                    {igConnectionStatus === 'success' ? 'เชื่อมต่อ IG แล้ว' : 'ดึงข้อมูลบัญชี Instagram'}
                  </Button>
                   {igConnectionMessage && (
                    <p className={`text-sm mt-2 ${igConnectionStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>{igConnectionMessage}</p>
                  )}
                </div>
              </div>
            </Card>

            <Card title="2. ใส่ข้อมูลสินค้า" icon={<GoogleSheetsIcon />}>
                <div className="space-y-4">
                    <label htmlFor="sheet-data" className="mb-2 font-semibold text-gray-700 dark:text-gray-300">ข้อมูลสินค้า (คัดลอกมาจาก Google Sheets)</label>
                    <textarea
                        id="sheet-data"
                        rows={6}
                        value={sheetData}
                        onChange={e => setSheetData(e.target.value)}
                        placeholder={"ตัวอย่าง:\nหัวข้อ,รายละเอียด\nสินค้า,เสื้อยืดคอตตอน 100%\nราคา,590 บาท"}
                        className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    ></textarea>
                    <button onClick={handleDownloadExample} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">ดาวน์โหลดไฟล์ตัวอย่าง (.csv)</button>
                     <TextInput label="ลิงก์สินค้า (เช่น Shopee, Lazada)" value={shopeeLink} onChange={e => setShopeeLink(e.target.value)} placeholder="https://..." />
                </div>
            </Card>

            <Card title="3. เตรียมสื่อ (รูปภาพ/วิดีโอ)" icon={<UploadIcon />}>
                <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                  <button onClick={() => setImageSourceTab('upload')} className={`px-4 py-2 text-sm font-medium ${imageSourceTab === 'upload' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>อัปโหลด</button>
                  <button onClick={() => setImageSourceTab('generateImage')} className={`px-4 py-2 text-sm font-medium ${imageSourceTab === 'generateImage' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>สร้างรูปด้วย AI</button>
                  <button onClick={() => setImageSourceTab('generateVideo')} className={`px-4 py-2 text-sm font-medium ${imageSourceTab === 'generateVideo' ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}>สร้างวิดีโอด้วย AI</button>
                </div>
                {imageSourceTab === 'upload' ? (
                  <ImageUploader onImageUpload={setUploadedImage} />
                ) : imageSourceTab === 'generateImage' ? (
                  <div className="space-y-3">
                    <TextInput label="คำสั่งสำหรับสร้างรูปภาพ (ภาษาอังกฤษ)" value={imageGenerationPrompt} onChange={e => setImageGenerationPrompt(e.target.value)} placeholder="e.g., a photorealistic shot of a cotton t-shirt on a mannequin" />
                    <Button onClick={handleGenerateImageFromPrompt} isLoading={isGeneratingImage}>สร้างรูปภาพ</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <TextInput label="คำสั่งสำหรับสร้างวิดีโอ (ภาษาอังกฤษ)" value={videoGenerationPrompt} onChange={e => setVideoGenerationPrompt(e.target.value)} placeholder="e.g., a time-lapse of a flower blooming" />
                    <div>
                      <label className="mb-2 font-semibold text-gray-700 dark:text-gray-300 block">สัดส่วนภาพ (Aspect Ratio)</label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="aspectRatio" 
                            value="16:9" 
                            checked={videoAspectRatio === '16:9'} 
                            onChange={() => setVideoAspectRatio('16:9')}
                            className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">16:9 (แนวนอน)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="aspectRatio" 
                            value="9:16" 
                            checked={videoAspectRatio === '9:16'} 
                            onChange={() => setVideoAspectRatio('9:16')}
                            className="form-radio h-4 w-4 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-600 focus:ring-indigo-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">9:16 (แนวตั้ง)</span>
                        </label>
                      </div>
                    </div>
                    <Button onClick={handleGenerateVideo} isLoading={isGeneratingVideo}>สร้างวิดีโอ</Button>
                    {isGeneratingVideo && videoGenerationStatusMessage && (
                        <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{videoGenerationStatusMessage}</p>
                        </div>
                    )}
                  </div>
                )}
            </Card>
            
            <Card title="4. สร้างแคปชั่นด้วย AI" icon={<SparklesIcon />}>
              <div className="space-y-4">
                  <div>
                    <label htmlFor="prompt-template" className="mb-2 font-semibold text-gray-700 dark:text-gray-300 block">เลือกเทมเพลต (ไม่บังคับ)</label>
                    <select id="prompt-template" onChange={e => setCustomPrompt(e.target.value)} className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                      {promptTemplates.map(t => <option key={t.name} value={t.value}>{t.name}</option>)}
                    </select>
                  </div>
                   <div>
                    <label htmlFor="custom-prompt" className="mb-2 font-semibold text-gray-700 dark:text-gray-300 block">คำสั่งเพิ่มเติม (ภาษาไทย)</label>
                    <textarea
                        id="custom-prompt"
                        rows={3}
                        value={customPrompt}
                        onChange={e => setCustomPrompt(e.target.value)}
                        placeholder="เช่น: เน้นโปรโมชั่น 1 แถม 1, เขียนให้ดูวัยรุ่นขึ้น, เพิ่มคำถามตอนท้าย"
                        className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="temperature" className="text-sm font-medium text-gray-700 dark:text-gray-300">ความสร้างสรรค์: {temperature}</label>
                        <input type="range" id="temperature" min="0" max="1" step="0.1" value={temperature} onChange={e => setTemperature(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                      </div>
                      <div>
                        <label htmlFor="max-tokens" className="text-sm font-medium text-gray-700 dark:text-gray-300">ความยาวสูงสุด: {maxTokens} tokens</label>
                        <input type="range" id="max-tokens" min="100" max="1024" step="8" value={maxTokens} onChange={e => setMaxTokens(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                      </div>
                  </div>
                  <Button onClick={handleGeneratePost} isLoading={isLoading}>
                    {isLoading ? 'กำลังสร้างโพสต์...' : 'สร้างโพสต์ด้วย AI'}
                  </Button>
              </div>
            </Card>

          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <Card title="5. ตรวจสอบและโพสต์">
              <div className="space-y-4">
                <PostPreview 
                  pageName={pageName || 'ชื่อเพจของคุณ'}
                  pageId={facebookPageId}
                  content={generatedPost || "เนื้อหาที่ AI สร้างจะแสดงที่นี่..."}
                  imageUrl={uploadedImage?.base64 || ''}
                  mediaType={uploadedImage?.mediaType || 'image'}
                  onPageNameChange={setPageName}
                />
                {fbConnectionStatus === 'success' && (
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 !mt-2">
                    คุณสามารถแก้ไขชื่อเพจในพรีวิวได้โดยตรง (สำหรับการแสดงผลเท่านั้น)
                  </p>
                )}
                 <div>
                    <label htmlFor="post-content" className="font-semibold text-gray-700 dark:text-gray-300">แก้ไขแคปชั่น:</label>
                    <textarea
                        id="post-content"
                        rows={8}
                        value={generatedPost}
                        onChange={e => setGeneratedPost(e.target.value)}
                        className="w-full p-2 mt-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="schedule-time" className="font-semibold text-gray-700 dark:text-gray-300">ตั้งเวลาโพสต์ (ไม่บังคับ)</label>
                        <input type="datetime-local" id="schedule-time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full mt-2 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" />
                    </div>
                    <div>
                        <label htmlFor="privacy" className="font-semibold text-gray-700 dark:text-gray-300">การแสดงผล</label>
                         <select id="privacy" value={postPrivacy} onChange={e => setPostPrivacy(e.target.value as 'published' | 'unpublished')} className="w-full mt-2 p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md" disabled={!!scheduledTime}>
                            <option value="published">แสดงบนฟีด (Published)</option>
                            <option value="unpublished">ไม่แสดงบนฟีด (Unpublished)</option>
                        </select>
                        {!!scheduledTime && <p className="text-xs text-amber-600 mt-1">โพสต์ที่ตั้งเวลาจะถูกตั้งเป็น Unpublished โดยอัตโนมัติ</p>}
                    </div>
                </div>
                 <Checkbox 
                    label="โพสต์ลง Instagram พร้อมกัน"
                    checked={postToInstagram}
                    onChange={(e) => setPostToInstagram(e.target.checked)}
                    disabled={igConnectionStatus !== 'success'}
                 />
                 <Button onClick={handlePublish} isLoading={isPosting} disabled={isPostButtonDisabled}>
                   {isPosting ? 'กำลังโพสต์...' : (scheduledTime ? 'ตั้งเวลาโพสต์' : 'โพสต์เลย')}
                  </Button>
              </div>
            </Card>

            <LogHistory logs={logHistory} onPublish={handlePublishNow} />
          </div>
        </div>
      </main>
      <InstructionsModal isOpen={isInstructionsOpen} onClose={() => setIsInstructionsOpen(false)} />
    </>
  );
};
