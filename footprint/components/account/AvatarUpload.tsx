'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

export interface AvatarUploadProps {
  /** Current avatar URL */
  currentAvatarUrl: string | null;
  /** Callback when upload is successful */
  onUploadSuccess: (newUrl: string) => void;
  /** Optional className */
  className?: string;
}

/**
 * AvatarUpload - Component for uploading and previewing avatar images
 * Supports JPEG and PNG up to 5MB with preview before save
 */
export function AvatarUpload({
  currentAvatarUrl,
  onUploadSuccess,
  className = '',
}: AvatarUploadProps): React.ReactElement {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setError(null);

      // Validate file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('יש להעלות קובץ מסוג JPEG או PNG');
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setError('גודל הקובץ חייב להיות עד 5MB');
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedFile(file);
    },
    []
  );

  const handleCancel = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onUploadSuccess(data.avatarUrl);

      // Clear state
      handleCancel();
    } catch {
      setError('שגיאה בהעלאת התמונה');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, onUploadSuccess, handleCancel]);

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Avatar Display */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={previewUrl ? 'תצוגה מקדימה' : 'תמונת פרופיל'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              data-testid="avatar-placeholder"
              className="w-full h-full flex items-center justify-center"
            >
              <User className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Camera overlay when not in selection mode */}
        {!selectedFile && (
          <button
            onClick={handleButtonClick}
            className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
            aria-label="שנה תמונה"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="avatar-input"
        aria-label="בחר קובץ תמונה"
      />

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-500 text-center" role="alert">
          {error}
        </p>
      )}

      {/* Buttons */}
      {selectedFile ? (
        <div className="flex gap-2">
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            disabled={isUploading}
          >
            ביטול
          </Button>
          <Button onClick={handleUpload} size="sm" disabled={isUploading}>
            {isUploading ? (
              <span data-testid="upload-loading" className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                מעלה...
              </span>
            ) : (
              'שמור'
            )}
          </Button>
        </div>
      ) : (
        <Button onClick={handleButtonClick} variant="outline" size="sm">
          העלה תמונה
        </Button>
      )}
    </div>
  );
}

AvatarUpload.displayName = 'AvatarUpload';
