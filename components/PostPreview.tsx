
import React from 'react';

interface PostPreviewProps {
  pageId: string;
  pageName: string;
  content: string;
  imageUrl: string;
  mediaType: 'image' | 'video';
  onPageNameChange: (newName: string) => void;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ pageId, pageName, content, imageUrl, mediaType, onPageNameChange }) => {
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
      <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800/50 min-h-[200px] flex items-center justify-center">
        {imageUrl ? (
          mediaType === 'video' ? (
              <video src={imageUrl} controls className="w-full h-auto object-cover" />
          ) : (
              <img src={imageUrl} alt="Post preview" className="w-full h-auto object-cover" />
          )
        ) : (
           <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
              <p>รูปภาพหรือวิดีโอ</p>
              <p>จะแสดงที่นี่</p>
           </div>
        )}
      </div>
    </div>
  );
};
