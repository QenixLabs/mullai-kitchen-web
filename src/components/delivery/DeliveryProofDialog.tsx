"use client";

import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUploadFile } from "@/api/hooks/useStorage";
import { FaCamera, FaCheck, FaCircleNotch, FaTimes } from "react-icons/fa";

interface DeliveryProofDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (proofUrl: string) => void;
  isPending: boolean;
  orderLabel?: string;
}

export function DeliveryProofDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  orderLabel,
}: DeliveryProofDialogProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadFile();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setUploadedUrl(null);

      try {
        const result = await uploadFile.mutateAsync(file);
        setUploadedUrl(result.url);
      } catch {
        setPreview(null);
      }
    },
    [uploadFile],
  );

  const handleConfirm = () => {
    if (uploadedUrl) {
      onSubmit(uploadedUrl);
    }
  };

  const handleCancel = () => {
    setPreview(null);
    setUploadedUrl(null);
    onOpenChange(false);
  };

  const isUploading = uploadFile.isPending;
  const canConfirm = Boolean(uploadedUrl) && !isPending;

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delivery Proof</DialogTitle>
        </DialogHeader>

        {orderLabel && (
          <p className="text-sm text-muted-foreground">
            Confirm delivery for <span className="font-medium text-foreground">{orderLabel}</span>
          </p>
        )}

        <div className="flex flex-col gap-4">
          {!preview && (
            <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border p-6">
              <FaCamera className="text-2xl text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Take a photo of the delivered order
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <FaCamera aria-hidden />
                <span>Capture Photo</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {preview && (
            <div className="flex flex-col gap-3">
              <div className="relative overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Delivery proof preview"
                  className="h-48 w-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <FaCircleNotch className="animate-spin text-2xl text-white" />
                  </div>
                )}
              </div>

              {uploadedUrl && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <FaCheck aria-hidden />
                  <span>Photo uploaded</span>
                </div>
              )}

              {uploadFile.isError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <FaTimes aria-hidden />
                  <span>Upload failed. Try again.</span>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPreview(null);
                    setUploadedUrl(null);
                  }}
                  disabled={isPending || isUploading}
                >
                  Retake
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className="bg-green-600 text-white hover:bg-green-600/90"
                >
                  {isPending ? (
                    <FaCircleNotch className="animate-spin" aria-hidden />
                  ) : (
                    <FaCheck aria-hidden />
                  )}
                  Confirm Delivered
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
