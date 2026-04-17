import { useMutation } from '@tanstack/react-query';
import { storageApi } from '@/api/storage.api';
import { toast } from 'sonner';

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => storageApi.uploadFile(file),
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to upload file');
    },
  });
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: (filename: string) => storageApi.deleteFile(filename),
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to delete file');
    },
  });
}
