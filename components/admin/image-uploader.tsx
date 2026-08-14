"use client";

import React, { useState, useRef, useCallback } from "react";
import { UploadCloud, Loader2, X, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  name?: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
  onUploadComplete?: (url: string) => void;
}

export function ImageUploader({
  name = "image",
  defaultValue = "",
  required = false,
  className,
  onUploadComplete,
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string>(defaultValue);
  const [previewUrl, setPreviewUrl] = useState<string>(defaultValue);
  const [fileName, setFileName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (file: File) => {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload a valid image file (PNG, JPG, WEBP)");
        return;
      }

      // Validate size (max 4MB)
      if (file.size > 4 * 1024 * 1024) {
        setError("Image size must be less than 4MB");
        return;
      }

      setError(null);
      setIsUploading(true);
      setProgress(0);
      setFileName(file.name);

      // Local preview
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      try {
        const res = await uploadFiles("eventImage", {
          files: [file],
          onUploadProgress: ({ progress: currentProgress }) => {
            setProgress(currentProgress);
          },
        });

        if (!res || res.length === 0 || !res[0].ufsUrl) {
          throw new Error("Upload failed. No URL returned.");
        }

        const uploadedUrl = res[0].ufsUrl;
        setImageUrl(uploadedUrl);
        setPreviewUrl(uploadedUrl);
        onUploadComplete?.(uploadedUrl);
      } catch (err: unknown) {
        console.error("Direct upload error:", err);
        const message = err instanceof Error ? err.message : "Failed to upload image. Please try again.";
        setError(message);
        setPreviewUrl(imageUrl); // revert back to existing url if any
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [imageUrl, onUploadComplete]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleUpload(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageUrl("");
    setPreviewUrl("");
    setFileName("");
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="hidden"
        name={name}
        value={imageUrl}
        required={required}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all">
          <div className="relative aspect-[16/9] w-full max-h-72 overflow-hidden bg-muted/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Event cover preview"
              className={cn(
                "h-full w-full object-cover transition-opacity duration-300",
                isUploading ? "opacity-40" : "opacity-100"
              )}
            />

            {isUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-xs p-4 text-center">
                <Loader2 className="size-8 animate-spin text-primary" />
                <div className="w-48 space-y-1">
                  <div className="flex justify-between text-xs font-medium text-foreground">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                {fileName && <p className="max-w-xs truncate text-xs text-muted-foreground">{fileName}</p>}
              </div>
            )}

            {!isUploading && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-xs transition hover:bg-background"
                >
                  Change Image
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex size-7 items-center justify-center rounded-lg bg-destructive/90 text-destructive-foreground shadow-sm backdrop-blur-xs transition hover:bg-destructive"
                  title="Remove image"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {!isUploading && imageUrl && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-md bg-background/90 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-xs">
                <CheckCircle2 className="size-3.5 text-emerald-500" />
                <span>Uploaded</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-border hover:bg-muted/30",
            error && "border-destructive/60"
          )}
        >
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-hover:scale-105 group-hover:text-foreground">
            <UploadCloud className="size-6" />
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary hover:underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              SVG, PNG, JPG or WEBP (Max 4MB)
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
