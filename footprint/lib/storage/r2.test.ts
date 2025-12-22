import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getUploadUrl,
  getDownloadUrl,
  uploadToR2,
  deleteFromR2,
  generateImageKey,
  getPublicUrl,
  R2StorageError,
  type R2UploadResult,
} from './r2';

// Mock AWS SDK
const mockSend = vi.fn().mockResolvedValue({});

vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: class MockS3Client {
      send = mockSend;
    },
    PutObjectCommand: class MockPutObjectCommand {
      constructor(public params: unknown) {}
    },
    GetObjectCommand: class MockGetObjectCommand {
      constructor(public params: unknown) {}
    },
    DeleteObjectCommand: class MockDeleteObjectCommand {
      constructor(public params: unknown) {}
    },
  };
});

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://presigned-url.example.com/test'),
}));

// Mock environment variables
const mockEnv = {
  R2_ACCOUNT_ID: 'test-account-id',
  R2_ACCESS_KEY_ID: 'test-access-key',
  R2_SECRET_ACCESS_KEY: 'test-secret-key',
  R2_BUCKET_NAME: 'test-bucket',
  R2_PUBLIC_URL: 'https://images.footprint.co.il',
};

describe('R2 Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      vi.stubEnv(key, value);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('generateImageKey', () => {
    it('should generate key for uploads folder', () => {
      const key = generateImageKey('user123', 'test-image.jpg', 'uploads');
      expect(key).toMatch(/^uploads\/user123\/\d+-[a-f0-9-]+\.jpg$/);
    });

    it('should generate key for transformed folder', () => {
      const key = generateImageKey('user123', 'test-image.png', 'transformed');
      expect(key).toMatch(/^transformed\/user123\/\d+-[a-f0-9-]+\.png$/);
    });

    it('should generate key for print-ready folder', () => {
      const key = generateImageKey('order456', 'print.jpeg', 'print-ready');
      expect(key).toMatch(/^print-ready\/order456\/\d+-[a-f0-9-]+\.jpeg$/);
    });

    it('should generate key for thumbnails folder', () => {
      const key = generateImageKey('user123', 'thumb.webp', 'thumbnails');
      expect(key).toMatch(/^thumbnails\/user123\/\d+-[a-f0-9-]+\.webp$/);
    });

    it('should preserve file extension', () => {
      const jpgKey = generateImageKey('user', 'photo.jpg', 'uploads');
      const pngKey = generateImageKey('user', 'photo.png', 'uploads');
      const heicKey = generateImageKey('user', 'photo.HEIC', 'uploads');

      expect(jpgKey).toContain('.jpg');
      expect(pngKey).toContain('.png');
      expect(heicKey).toContain('.heic');
    });

    it('should include timestamp in key', () => {
      const now = Date.now();
      const key = generateImageKey('user123', 'test.jpg', 'uploads');
      const timestampMatch = key.match(/\/(\d+)-/);

      expect(timestampMatch).not.toBeNull();
      const timestamp = parseInt(timestampMatch![1], 10);
      expect(timestamp).toBeGreaterThanOrEqual(now - 1000);
      expect(timestamp).toBeLessThanOrEqual(now + 1000);
    });
  });

  describe('getUploadUrl', () => {
    it('should generate presigned upload URL', async () => {
      const result = await getUploadUrl('user123', 'photo.jpg', 'image/jpeg');

      expect(result.uploadUrl).toBe('https://presigned-url.example.com/test');
      expect(result.key).toMatch(/^uploads\/user123\/\d+-[a-f0-9-]+\.jpg$/);
      expect(result.publicUrl).toContain('https://images.footprint.co.il');
    });

    it('should include content type in presigned URL', async () => {
      const result = await getUploadUrl('user123', 'photo.png', 'image/png');
      expect(result.uploadUrl).toBeDefined();
    });

    it('should use custom folder when specified', async () => {
      const result = await getUploadUrl(
        'user123',
        'transformed.jpg',
        'image/jpeg',
        'transformed'
      );

      expect(result.key).toMatch(/^transformed\/user123\//);
    });

    it('should set expiration time for presigned URL', async () => {
      const result = await getUploadUrl('user123', 'photo.jpg', 'image/jpeg');
      expect(result.expiresIn).toBe(3600); // 1 hour
    });
  });

  describe('getDownloadUrl', () => {
    it('should generate presigned download URL', async () => {
      const url = await getDownloadUrl('uploads/user123/1234-uuid.jpg');
      expect(url).toBe('https://presigned-url.example.com/test');
    });

    it('should use custom expiration time', async () => {
      const url = await getDownloadUrl('uploads/user123/1234-uuid.jpg', 7200);
      expect(url).toBeDefined();
    });
  });

  describe('uploadToR2', () => {
    it('should upload buffer to R2', async () => {
      const buffer = Buffer.from('test image data');
      const result = await uploadToR2(
        buffer,
        'user123',
        'photo.jpg',
        'image/jpeg'
      );

      expect(result.key).toBeDefined();
      expect(result.publicUrl).toBeDefined();
      expect(result.size).toBe(buffer.length);
    });

    it('should return correct public URL', async () => {
      const buffer = Buffer.from('test image data');
      const result = await uploadToR2(
        buffer,
        'user123',
        'photo.jpg',
        'image/jpeg'
      );

      expect(result.publicUrl).toContain('https://images.footprint.co.il');
      expect(result.publicUrl).toContain('uploads/user123/');
    });

    it('should upload to specified folder', async () => {
      const buffer = Buffer.from('test image data');
      const result = await uploadToR2(
        buffer,
        'user123',
        'transformed.jpg',
        'image/jpeg',
        'transformed'
      );

      expect(result.key).toMatch(/^transformed\//);
    });
  });

  describe('deleteFromR2', () => {
    it('should delete object from R2', async () => {
      await expect(
        deleteFromR2('uploads/user123/1234-uuid.jpg')
      ).resolves.not.toThrow();
    });

    it('should handle non-existent keys gracefully', async () => {
      await expect(
        deleteFromR2('non-existent/key.jpg')
      ).resolves.not.toThrow();
    });
  });

  describe('R2StorageError', () => {
    it('should be throwable with message', () => {
      const error = new R2StorageError('Upload failed');
      expect(error.message).toBe('Upload failed');
      expect(error.name).toBe('R2StorageError');
    });

    it('should include error code', () => {
      const error = new R2StorageError('Upload failed', 'UPLOAD_FAILED');
      expect(error.code).toBe('UPLOAD_FAILED');
    });

    it('should include original error', () => {
      const originalError = new Error('Network error');
      const error = new R2StorageError('Upload failed', 'UPLOAD_FAILED', originalError);
      expect(error.cause).toBe(originalError);
    });
  });

  describe('Error Handling', () => {
    it('should throw R2StorageError on missing environment variables', async () => {
      vi.unstubAllEnvs();
      vi.stubEnv('R2_ACCOUNT_ID', '');

      // This should be handled gracefully
      await expect(
        getUploadUrl('user123', 'photo.jpg', 'image/jpeg')
      ).rejects.toThrow();
    });
  });

  describe('URL Generation', () => {
    it('should generate correct public URL format', async () => {
      const result = await getUploadUrl('user123', 'photo.jpg', 'image/jpeg');
      const expectedPattern = /^https:\/\/images\.footprint\.co\.il\/uploads\/user123\/\d+-[a-f0-9-]+\.jpg$/;
      expect(result.publicUrl).toMatch(expectedPattern);
    });
  });

  describe('getPublicUrl', () => {
    it('should return public URL for a key', () => {
      const url = getPublicUrl('uploads/user123/1234-uuid.jpg');
      expect(url).toBe('https://images.footprint.co.il/uploads/user123/1234-uuid.jpg');
    });

    it('should handle different folder paths', () => {
      const uploadUrl = getPublicUrl('uploads/user123/image.jpg');
      const transformedUrl = getPublicUrl('transformed/user123/image.jpg');
      const printUrl = getPublicUrl('print-ready/order123/image.jpg');

      expect(uploadUrl).toContain('uploads');
      expect(transformedUrl).toContain('transformed');
      expect(printUrl).toContain('print-ready');
    });
  });

  describe('Error Scenarios', () => {
    it('should throw R2StorageError when getSignedUrl fails for upload', async () => {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      vi.mocked(getSignedUrl).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        getUploadUrl('user123', 'photo.jpg', 'image/jpeg')
      ).rejects.toThrow(R2StorageError);
    });

    it('should throw R2StorageError when getSignedUrl fails for download', async () => {
      const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
      vi.mocked(getSignedUrl).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        getDownloadUrl('uploads/user123/image.jpg')
      ).rejects.toThrow(R2StorageError);
    });

    it('should throw R2StorageError when upload to R2 fails', async () => {
      mockSend.mockRejectedValueOnce(new Error('Upload failed'));

      await expect(
        uploadToR2(Buffer.from('test'), 'user123', 'photo.jpg', 'image/jpeg')
      ).rejects.toThrow(R2StorageError);
    });

    it('should throw R2StorageError when delete from R2 fails', async () => {
      mockSend.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(
        deleteFromR2('uploads/user123/image.jpg')
      ).rejects.toThrow(R2StorageError);
    });

    it('should include error code in R2StorageError for upload failure', async () => {
      mockSend.mockRejectedValueOnce(new Error('Upload failed'));

      try {
        await uploadToR2(Buffer.from('test'), 'user123', 'photo.jpg', 'image/jpeg');
      } catch (error) {
        expect(error).toBeInstanceOf(R2StorageError);
        expect((error as R2StorageError).code).toBe('UPLOAD_FAILED');
      }
    });

    it('should include error code in R2StorageError for delete failure', async () => {
      mockSend.mockRejectedValueOnce(new Error('Delete failed'));

      try {
        await deleteFromR2('uploads/user123/image.jpg');
      } catch (error) {
        expect(error).toBeInstanceOf(R2StorageError);
        expect((error as R2StorageError).code).toBe('DELETE_FAILED');
      }
    });
  });
});
