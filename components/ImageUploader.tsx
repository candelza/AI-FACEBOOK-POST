import React, { useState, useCallback, useRef } from 'react';
import type { UploadedImage } from '../types';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (image: UploadedImage | null) => void;
  accept?: string;
  helpText?: string;
  acceptedMediaTypes?: ('image' | 'video')[];
  multiple?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload,
  accept = "image/png, image/jpeg, image/webp, video/mp4, video/mov, video/quicktime",
  helpText = "รองรับ: PNG, JPG, WEBP, MP4, MOV",
  acceptedMediaTypes = ['image', 'video'],
  multiple = false,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      if (!multiple) {
          setPreview(null);
          setPreviewType(null);
          onImageUpload(null);
      }
      return;
    }

    const processFile = (file: File) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!((isImage && acceptedMediaTypes.includes('image')) || (isVideo && acceptedMediaTypes.includes('video')))) {
            // Skip invalid file types in multi-upload mode
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const mediaType = isVideo ? 'video' : 'image';
            
            onImageUpload({
                file: file,
                base64: base64String,
                mimeType: file.type,
                mediaType: mediaType,
            });

            if (!multiple) {
                setPreview(base64String);
                setPreviewType(mediaType);
            }
        };
        reader.readAsDataURL(file);
    };

    // If multiple is false, clear previous upload and process the first file
    if (!multiple) {
        onImageUpload(null);
        setPreview(null);
        setPreviewType(null);
        processFile(files[0]);
    } else { // If multiple is true, process all selected files
        Array.from(files).forEach(processFile);
    }

    // Clear the file input so the same file(s) can be selected again
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [onImageUpload, acceptedMediaTypes, multiple]);


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
  }, [handleFileChange]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col">
      <div 
        className="relative w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex justify-center items-center text-gray-500 dark:text-gray-400 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          multiple={multiple}
        />
        {preview && !multiple ? (
          previewType === 'video' ? (
             <video src={preview} muted autoPlay loop className="object-cover w-full h-full rounded-lg" />
          ) : (
            <img src={preview} alt="Image preview" className="object-cover w-full h-full rounded-lg" />
          )
        ) : (
          <div className="text-center">
            <UploadIcon />
            <p>คลิกเพื่ออัปโหลด หรือลากไฟล์มาวาง</p>
            <p className="text-xs">{helpText}</p>
          </div>
        )}
      </div>
    </div>
  );
};