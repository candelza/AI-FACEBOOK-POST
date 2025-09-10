export interface UploadedImage {
  file?: File;
  base64: string;
  mimeType: string;
  mediaType: 'image' | 'video';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  content: string;
  imageUrl: string;
  mediaType: 'image' | 'video';
  status: 'Generated' | 'Posted' | 'Scheduled' | 'Failed';
  pageId: string;
  scheduledTimestamp?: string;
}