/**
 * DropZone Component
 *
 * UP-02: Drag-and-Drop Upload on Desktop
 *
 * Allows users to drag and drop images from their desktop.
 * Also supports click-to-upload as fallback.
 */

'use client';

import { useCallback, useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import toast from 'react-hot-toast';
import { DEFAULT_UPLOAD_CONFIG, type UploadError } from '@/types/upload';

export interface DropZoneProps {
  onUploadComplete?: (file: File, preview: string) => void;
  className?: string;
}

export default function DropZone({
  onUploadComplete,
  className = '',
}: DropZoneProps): JSX.Element {
  const { setOriginalImage } = useOrderStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = useCallback((file: File): UploadError | null => {
    // Check file type
    const validTypes = DEFAULT_UPLOAD_CONFIG.acceptedTypes;
    if (!(validTypes as readonly string[]).includes(file.type)) {
      return {
        code: 'INVALID_TYPE',
        message: 'פורמט קובץ לא נתמך. אנא בחרו JPG, PNG או HEIC',
      };
    }

    // Check file size (20MB max)
    if (file.size > DEFAULT_UPLOAD_CONFIG.maxSizeBytes) {
      return {
        code: 'FILE_TOO_LARGE',
        message: 'הקובץ גדול מדי. גודל מקסימלי: 20MB',
      };
    }

    return null;
  }, []);

  const processFile = useCallback(
    (file: File) => {
      // Validate file
      const error = validateFile(file);
      if (error) {
        toast.error(error.message);
        return;
      }

      // Create preview URL
      try {
        const previewUrl = URL.createObjectURL(file);

        // Update order store
        setOriginalImage(previewUrl, file);

        // Show success message
        toast.success('התמונה הועלתה בהצלחה!');

        // Call optional callback
        onUploadComplete?.(file, previewUrl);
      } catch (err) {
        toast.error('שגיאה בהעלאת התמונה. אנא נסו שוב');
        console.error('Upload error:', err);
      }
    },
    [validateFile, setOriginalImage, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) {
        return;
      }

      // Process only the first file
      const file = files[0];
      processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set dragging to false if we're leaving the drop zone itself
    // (not when moving between child elements)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;

      if (!files || files.length === 0) {
        return;
      }

      // Process only the first file
      const file = files[0];
      processFile(file);
    },
    [processFile]
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic"
        onChange={handleFileChange}
        className="sr-only"
        id="dropzone-upload"
        aria-label="העלאת תמונה"
      />

      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`
          card p-12 cursor-pointer transition-all duration-200
          flex flex-col items-center justify-center text-center
          ${
            isDragging
              ? 'border-brand-purple bg-brand-purple/5'
              : 'hover:border-zinc-400'
          }
        `}
      >
        <div
          className={`
            w-20 h-20 rounded-2xl mb-6 flex items-center justify-center
            ${
              isDragging
                ? 'bg-brand-purple/20 text-brand-purple'
                : 'bg-zinc-100 text-zinc-500'
            }
          `}
        >
          {isDragging ? (
            <ImageIcon className="w-10 h-10" />
          ) : (
            <Upload className="w-10 h-10" />
          )}
        </div>

        <h3 className="text-xl font-semibold mb-2 text-zinc-900">
          {isDragging ? 'שחררו כאן' : 'גררו תמונה לכאן'}
        </h3>

        <p className="text-zinc-500 mb-6">או לחצו לבחירה מהמכשיר</p>

        <button type="button" className="btn btn-secondary" onClick={handleClick}>
          בחירת תמונה
        </button>

        <p className="text-xs text-zinc-500 mt-6">JPG, PNG, HEIC עד 20MB</p>
      </div>
    </div>
  );
}
