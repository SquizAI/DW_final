export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  path: string;
  preview?: {
    columns: string[];
    rowCount: number;
    sampleData: Record<string, any>[];
  };
  metadata?: Record<string, any>;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface FileUploadOptions {
  onProgress?: (progress: number) => void;
  metadata?: Record<string, any>;
}

export interface FileService {
  uploadFile: (file: File, options?: FileUploadOptions) => Promise<FileMetadata>;
  downloadFile: (fileId: string) => Promise<Blob>;
  deleteFile: (fileId: string) => Promise<void>;
  getFileMetadata: (fileId: string) => Promise<FileMetadata>;
  listFiles: () => Promise<FileMetadata[]>;
}

export type FileType = 'csv' | 'json' | 'excel' | 'parquet' | 'other';

export interface FileFilter {
  type?: FileType[];
  search?: string;
  sortBy?: 'name' | 'size' | 'uploadedAt';
  sortOrder?: 'asc' | 'desc';
} 