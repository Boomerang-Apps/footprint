/**
 * ImagePreview Component
 *
 * UP-04: Preview Uploaded Photo
 *
 * Displays uploaded image with metadata and option to replace
 */

'use client';

import { X, RefreshCw } from 'lucide-react';

export interface ImagePreviewProps {
  imageUrl: string;
  file: File;
  dimensions?: { width: number; height: number };
  onReplace?: () => void;
  onRemove?: () => void;
  className?: string;
}

export default function ImagePreview({
  imageUrl,
  file,
  dimensions,
  onReplace,
  onRemove,
  className = '',
}: ImagePreviewProps): React.ReactElement {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Image Display */}
      <div className="relative rounded-xl overflow-hidden bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element -- Using img for blob URLs from user uploads */}
        <img
          src={imageUrl}
          alt={`תצוגה מקדימה של ${file.name}`}
          className="w-full h-auto object-contain max-h-96"
        />

        {/* Remove Button (top-right) */}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition"
            aria-label="הסר תמונה"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-4 space-y-2">
        {/* Filename */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-900">{file.name}</span>
          <span className="text-zinc-500">{formatFileSize(file.size)}</span>
        </div>

        {/* Dimensions */}
        {dimensions && (
          <div className="text-sm text-zinc-500">
            {dimensions.width} × {dimensions.height} פיקסלים
          </div>
        )}

        {/* Replace Button */}
        {onReplace && (
          <button
            type="button"
            onClick={onReplace}
            className="btn btn-secondary w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>החלף תמונה</span>
          </button>
        )}
      </div>
    </div>
  );
}
