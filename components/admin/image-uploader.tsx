"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Plus,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import { uploadFiles } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  name?: string;
  defaultValue?: string | string[];
  required?: boolean;
  maxFiles?: number;
  maxFileSizeMb?: number;
  className?: string;
  onUploadComplete?: (urls: string[]) => void;
}

export function ImageUploader({
  name = "image",
  defaultValue = "",
  required = false,
  maxFiles = 5,
  maxFileSizeMb = 10,
  className,
  onUploadComplete,
}: ImageUploaderProps) {
  // Parse initial default value
  const parseDefault = (): string[] => {
    if (!defaultValue) return [];
    if (Array.isArray(defaultValue)) return defaultValue;
    if (typeof defaultValue === "string") {
      if (defaultValue.startsWith("[")) {
        try {
          const parsed = JSON.parse(defaultValue);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // ignore
        }
      }
      return [defaultValue];
    }
    return [];
  };

  const [images, setImages] = useState<string[]>(parseDefault());
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentUploadingCount, setCurrentUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const remainingSlots = maxFiles - images.length;
      if (remainingSlots <= 0) {
        setError(`You can only upload up to ${maxFiles} images.`);
        return;
      }

      const filesToUpload = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        setError(`Only ${remainingSlots} more image(s) can be added (max ${maxFiles}).`);
      } else {
        setError(null);
      }

      // Validate file types and sizes (maxFileSizeMb MB each)
      const maxSizeBytes = maxFileSizeMb * 1024 * 1024;
      for (const file of filesToUpload) {
        if (!file.type.startsWith("image/")) {
          setError(`"${file.name}" is not a valid image file.`);
          return;
        }
        if (file.size > maxSizeBytes) {
          setError(`"${file.name}" exceeds the maximum size of ${maxFileSizeMb}MB.`);
          return;
        }
      }

      setIsUploading(true);
      setCurrentUploadingCount(filesToUpload.length);
      setProgress(0);

      try {
        const res = await uploadFiles("eventImage", {
          files: filesToUpload,
          onUploadProgress: ({ progress: currentProgress }) => {
            setProgress(currentProgress);
          },
        });

        if (!res || res.length === 0) {
          throw new Error("Upload failed. No URLs returned.");
        }

        const uploadedUrls = res
          .map((item) => item.ufsUrl || (item as unknown as { url: string }).url)
          .filter(Boolean);

        setImages((prev) => {
          const updated = [...prev, ...uploadedUrls].slice(0, maxFiles);
          onUploadComplete?.(updated);
          return updated;
        });
      } catch (err: unknown) {
        console.error("Upload error:", err);
        const message =
          err instanceof Error
            ? err.message
            : "Failed to upload images. Please check file size and try again.";
        setError(message);
      } finally {
        setIsUploading(false);
        setCurrentUploadingCount(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [images, maxFiles, maxFileSizeMb, onUploadComplete]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      void handleUpload(files);
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
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      void handleUpload(files);
    }
  };

  const handleRemove = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onUploadComplete?.(updated);
      return updated;
    });
    setError(null);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const selected = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      const updated = [selected, ...remaining];
      onUploadComplete?.(updated);
      return updated;
    });
  };

  const primaryImage = images[0] || "";

  return (
    <div className={cn("space-y-3", className)}>
      {/* Hidden input for primary cover image */}
      <input
        type="hidden"
        name={name}
        value={primaryImage}
        required={required && images.length === 0}
      />
      {/* Hidden input for all image URLs (JSON stringified) */}
      <input
        type="hidden"
        name="images"
        value={JSON.stringify(images)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading || images.length >= maxFiles}
      />

      {/* Uploaded Images Grid */}
      {images.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="size-3.5" />
              <span>
                {images.length} of {maxFiles} image{maxFiles > 1 ? "s" : ""} uploaded
              </span>
            </div>
            {images.length < maxFiles && !isUploading && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                <Plus className="size-3.5" /> Add more
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {images.map((url, idx) => (
              <div
                key={url + idx}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-xl border bg-card shadow-xs transition-all",
                  idx === 0
                    ? "border-brass ring-2 ring-brass/30"
                    : "border-border hover:border-foreground/30"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Event image ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Badges / Controls Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center justify-between">
                    {idx === 0 ? (
                      <span className="rounded bg-brass px-1.5 py-0.5 font-mono text-[10px] font-semibold text-stage">
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        title="Set as Cover Image"
                        className="flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white hover:bg-black"
                      >
                        <Star className="size-2.5" /> Cover
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      title="Remove image"
                      className="flex size-5 items-center justify-center rounded-full bg-destructive text-white hover:bg-destructive/80"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                </div>

                {/* Static Cover Badge when not hovering */}
                {idx === 0 && (
                  <div className="absolute bottom-1.5 left-1.5 group-hover:opacity-0 transition-opacity">
                    <span className="rounded bg-brass/90 px-1.5 py-0.5 font-mono text-[9px] font-bold text-stage shadow-xs">
                      COVER
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Add More Slot */}
            {images.length < maxFiles && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted/40 hover:text-foreground",
                  isDragging && "border-primary bg-primary/5"
                )}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                    <Loader2 className="size-5 animate-spin text-primary" />
                    <span className="text-[10px] font-medium">{progress}%</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center p-2">
                    <Plus className="size-5" />
                    <span className="text-[10px] font-medium">Add Image</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-foreground/30 hover:bg-muted/30",
            error && "border-destructive/60"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="size-8 animate-spin text-primary" />
              <div className="w-48 space-y-1">
                <div className="flex justify-between text-xs font-medium text-foreground">
                  <span>Uploading {currentUploadingCount} image(s)...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground transition-transform group-hover:scale-105 group-hover:text-foreground">
                <UploadCloud className="size-6" />
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-sm font-medium text-foreground">
                  <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  SVG, PNG, JPG or WEBP (Max {maxFiles} images, up to {maxFileSizeMb}MB each)
                </p>
              </div>
            </>
          )}
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
