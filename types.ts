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
  thumbnailUrl: string;
  mediaType: 'image' | 'video' | 'carousel';
  status: 'Generated' | 'Posted' | 'Scheduled' | 'Failed';
  pageId: string;
  scheduledTimestamp?: string;
  facebookPostId?: string;
  privacy?: 'published' | 'unpublished';
}