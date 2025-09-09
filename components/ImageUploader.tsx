import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { UploadedImage } from '../types';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage | null) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreview(base64String);
        onImageUpload({
          file: file,
          base64: base64String,
          mimeType: file.type,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      onImageUpload(null);
    }
  }, [onImageUpload]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.files = event.dataTransfer.files;
        const changeEvent = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(changeEvent);
      }
      event.dataTransfer.clearData();
    }
  }, []);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Reset internal state if the component is being reset from parent
  useEffect(() => {
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
      setPreview(null);
  }, []);

  return (
    <div className="flex flex-col">
      <label className="mb-2 font-semibold text-gray-700 dark:text-gray-300">
        อัปโหลดรูปภาพ
      </label>
      <div 
        className="relative w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex justify-center items-center text-gray-500 dark:text-gray-400 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        {preview ? (
          <img src={preview} alt="Image preview" className="object-cover w-full h-full rounded-lg" />
        ) : (
          <div className="text-center">
            <UploadIcon />
            <p>คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง</p>
            <p className="text-xs">รองรับไฟล์: PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};
