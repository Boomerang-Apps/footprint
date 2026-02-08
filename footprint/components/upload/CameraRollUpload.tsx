/**
 * CameraRollUpload Component
 *
 * UP-01: Upload Photo from Camera Roll
 *
 * Allows users to select photos from their device's camera roll/file system.
 * Supports JPG, PNG, HEIC formats with validation.
 */

'use client';

import { useCallback, useRef, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { useOrderStore } from '@/stores/orderStore';
import toast from 'react-hot-toast';
import { DEFAULT_UPLOAD_CONFIG, type UploadError } from '@/types/upload';
import { logger } from '@/lib/logger';

export interface CameraRollUploadProps {
  onUploadComplete?: (file: File, preview: string) => void;
  className?: string;
}

export default function CameraRollUpload({
  onUploadComplete,
  className = '',
}: CameraRollUploadProps): React.ReactElement {
  const { setOriginalImage, setStep } = useOrderStore();
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;

      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];

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
        logger.error('Upload error', err);
      }
    },
    [validateFile, setOriginalImage, onUploadComplete]
  );

  const handleButtonClick = useCallback(() => {
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
        id="camera-roll-upload"
        aria-label="העלאת תמונה"
      />

      <button
        type="button"
        onClick={handleButtonClick}
        className="btn btn-primary flex items-center gap-2"
        aria-label="בחירת תמונה"
      >
        <Upload className="w-5 h-5" />
        <span>בחירת תמונה</span>
      </button>
    </div>
  );
}
