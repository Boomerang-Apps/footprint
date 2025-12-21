/**
 * Upload Types
 *
 * Type definitions for file upload functionality
 */

export interface UploadError {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'NO_FILE';
  message: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  file: File;
  preview: string;
  success: boolean;
  error?: UploadError;
}

export type SupportedImageType = 'image/jpeg' | 'image/png' | 'image/heic';

export interface UploadConfig {
  maxSizeBytes: number;
  acceptedTypes: SupportedImageType[];
  maxFiles: number;
}

export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxSizeBytes: 20 * 1024 * 1024, // 20MB
  acceptedTypes: ['image/jpeg', 'image/png', 'image/heic'],
  maxFiles: 1,
};
