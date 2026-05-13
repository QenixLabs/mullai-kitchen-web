'use client';

import { useRef, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useUploadFile } from '@/api/hooks/useStorage';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploadFieldProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImageUploadField({ value, onChange }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadFile();
  const isUploading = uploadFile.isPending;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) return;

    try {
      const result = await uploadFile.mutateAsync(file);
      onChange(result.url);
    } catch {
      // handled by mutation
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file) return;
      if (!file.type.match(/\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) return;

      try {
        const result = await uploadFile.mutateAsync(file);
        onChange(result.url);
      } catch {
        // handled by mutation
      }
    },
    [uploadFile, onChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    onChange('');
  };

  if (value) {
    return (
      <div className="relative w-full">
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-muted">
          <Image
            src={value}
            alt="Plan image"
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Change Image
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleRemove}
          >
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => !isUploading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/40 px-6 py-10 transition-colors hover:border-primary/50 hover:bg-muted/60"
    >
      {isUploading ? (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-foreground">Uploading image...</p>
        </>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ImageIcon className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Click or drag image to upload
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG, PNG, GIF, WebP, SVG — up to 5MB
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Choose File
          </Button>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}
