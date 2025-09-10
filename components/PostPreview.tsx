import React from 'react';

interface PostPreviewProps {
  pageId: string;
  pageName: string;
  content: string;
  imageUrl: string;
}

export const PostPreview: React.FC<PostPreviewProps> = ({ pageId, pageName, content, imageUrl }) => {
  return (
    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-md">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-500 rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-200">
          {pageName.charAt(0) || 'P'}
        </div>
        <div className="ml-3">
          <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{pageName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">เมื่อสักครู่ · 🌎</p>
        </div>
      </div>
      <p className="mb-3 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{content}</p>
      <div className="rounded-lg overflow-hidden">
        <img src={imageUrl} alt="Post preview" className="w-full h-auto object-cover" />
      </div>
    </div>
  );
};
