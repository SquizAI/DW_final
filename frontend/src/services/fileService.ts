import { api } from '@/api';
import { FileMetadata, FileUploadOptions, FileFilter } from '@/types/files';

class FileService {
  private baseUrl = '/api/files';

  async uploadFile(file: File, options?: FileUploadOptions): Promise<FileMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }

    const response = await api.post(`${this.baseUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      },
    });

    return response.data;
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async deleteFile(fileId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${fileId}`);
  }

  async getFileMetadata(fileId: string): Promise<FileMetadata> {
    const response = await api.get(`${this.baseUrl}/${fileId}`);
    return response.data;
  }

  async listFiles(filter?: FileFilter): Promise<FileMetadata[]> {
    const response = await api.get(this.baseUrl, { params: filter });
    return response.data;
  }

  async previewFile(fileId: string): Promise<FileMetadata['preview']> {
    const response = await api.get(`${this.baseUrl}/${fileId}/preview`);
    return response.data;
  }

  getDownloadUrl(fileId: string): string {
    return `${this.baseUrl}/${fileId}/download`;
  }

  getPreviewUrl(fileId: string): string {
    return `${this.baseUrl}/${fileId}/preview`;
  }
}

export const fileService = new FileService();
export default fileService; 