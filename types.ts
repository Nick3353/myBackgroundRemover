export interface ProcessedImage {
  id: string;
  file: File;
  originalPreviewUrl: string;
  processedPreviewUrl: string | null;
  status: 'idle' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  originalWidth?: number;
  originalHeight?: number;
}

export interface ProcessingStats {
  total: number;
  completed: number;
  failed: number;
  processing: number;
}