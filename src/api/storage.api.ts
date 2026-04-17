import { apiClient } from '@/api/client';

const BASE = '/storage';

export interface UploadFileResponse {
  url: string;
  filename: string;
}

export const storageApi = {
  uploadFile: async (file: File): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<UploadFileResponse>(`${BASE}/upload`, formData, {
      headers: { 'Content-Type': undefined as unknown as string },
    });
    return response.data;
  },

  deleteFile: async (filename: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${filename}`);
  },
};
