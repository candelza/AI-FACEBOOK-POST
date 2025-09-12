import React, { useState, useEffect } from 'react';
import type { UploadedImage } from '../types';

interface PostPreviewProps {
  pageId: string;
  pageName: string;
  content: string;
  media: UploadedImage[];
  onPageNameChange: (newName: string) => void;
}

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);
const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
);


export const PostPreview: React.FC<PostPreviewProps> = ({ pageId, pageName, content, media, onPageNameChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset index if media changes, to avoid out-of-bounds index
    setCurrentIndex(0);
  }, [media]);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? media.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === media.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };
  
  const currentMedia = media.length > 0 ? media[currentIndex] : null;

  return (
    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-md">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-500 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-200 shrink-0">
          {pageName.charAt(0) || 'P'}
        </div>
        <div className="ml-3 flex-1">
          <input
            type="text"
            value={pageName}
            onChange={(e) => onPageNameChange(e.target.value)}
            aria-label="Edit Page Name for Preview"
            className="font-bold text-sm text-gray-900 dark:text-gray-100 bg-transparent focus:bg-gray-100 dark:focus:bg-gray-800 rounded px-1 -mx-1 w-full border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">เมื่อสักครู่ · 🌎</p>
        </div>
      </div>
      <p className="mb-3 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{content}</p>
      <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800/50 min-h-[200px] flex items-center justify-center aspect-square">
        {currentMedia ? (
          currentMedia.mediaType === 'video' ? (
              <video src={currentMedia.base64} controls className="w-full h-full object-cover" />
          ) : (
              <img src={currentMedia.base64} alt="Post preview" className="w-full h-full object-cover" />
          )
        ) : (
           <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
              <p>รูปภาพหรือวิดีโอ</p>
              <p>จะแสดงที่นี่</p>
           </div>
        )}
        {media.length > 1 && (
            <>
                <button onClick={goToPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-1.5 hover:bg-opacity-60 transition-opacity" aria-label="Previous image">
                    <ChevronLeftIcon />
                </button>
                <button onClick={goToNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white rounded-full p-1.5 hover:bg-opacity-60 transition-opacity" aria-label="Next image">
                    <ChevronRightIcon />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                    {media.map((_, index) => (
                        <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}></div>
                    ))}
                </div>
            </>
        )}
      </div>
    </div>
  );
};