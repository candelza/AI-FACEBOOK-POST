export interface UploadedImage {
  file: File;
  base64: string;
  mimeType: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  content: string;
  imageUrl: string;
  status: 'Generated' | 'Posted' | 'Scheduled' | 'Failed';
  pageId: string;
  scheduledTimestamp?: string;
}