import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { FileMetadata, FileUploadOptions, FileFilter, UploadProgress } from '@/types/files';
import fileService from '@/services/fileService';
import { notifications } from '@mantine/notifications';

interface FileContextType {
  files: FileMetadata[];
  uploadProgress: Record<string, UploadProgress>;
  isLoading: boolean;
  error: string | null;
  uploadFile: (file: File, options?: FileUploadOptions) => Promise<FileMetadata>;
  downloadFile: (fileId: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
  getFileById: (fileId: string) => FileMetadata | undefined;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fileList = await fileService.listFiles();
      setFiles(fileList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load files';
      setError(message);
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  const uploadFile = useCallback(async (file: File, options?: FileUploadOptions) => {
    const fileId = `${file.name}-${Date.now()}`;
    setUploadProgress(prev => ({
      ...prev,
      [fileId]: { fileId, progress: 0, status: 'uploading' }
    }));

    try {
      const uploadedFile = await fileService.uploadFile(file, {
        ...options,
        onProgress: (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileId]: { ...prev[fileId], progress }
          }));
          options?.onProgress?.(progress);
        }
      });

      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { fileId, progress: 100, status: 'completed' }
      }));

      setFiles(prev => [...prev, uploadedFile]);
      return uploadedFile;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload file';
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { fileId, progress: 0, status: 'error', error: message }
      }));
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
      throw err;
    }
  }, []);

  const downloadFile = useCallback(async (fileId: string) => {
    try {
      const blob = await fileService.downloadFile(fileId);
      const file = files.find(f => f.id === fileId);
      if (!file) throw new Error('File not found');

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download file';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
      throw err;
    }
  }, [files]);

  const deleteFile = useCallback(async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
      notifications.show({
        title: 'Success',
        message: 'File deleted successfully',
        color: 'green',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete file';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
      throw err;
    }
  }, []);

  const getFileById = useCallback((fileId: string) => {
    return files.find(f => f.id === fileId);
  }, [files]);

  const value = {
    files,
    uploadProgress,
    isLoading,
    error,
    uploadFile,
    downloadFile,
    deleteFile,
    refreshFiles,
    getFileById,
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}

export default FileContext; 