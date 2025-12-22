import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
const mockGetUploadUrl = vi.fn();
const mockUploadToR2 = vi.fn();
const mockValidateImage = vi.fn();
const mockOptimizeForPrint = vi.fn();
const mockConvertToJpeg = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/storage/r2', () => ({
  getUploadUrl: (...args: unknown[]) => mockGetUploadUrl(...args),
  uploadToR2: (...args: unknown[]) => mockUploadToR2(...args),
}));

vi.mock('@/lib/image/optimize', () => ({
  validateImage: (...args: unknown[]) => mockValidateImage(...args),
  optimizeForPrint: (...args: unknown[]) => mockOptimizeForPrint(...args),
  convertToJpeg: (...args: unknown[]) => mockConvertToJpeg(...args),
  MAX_FILE_SIZE: 20 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/heic', 'image/webp'],
}));

// Mock createClient from supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: () => mockGetUser(),
    },
  }),
}));

// Mock environment variables
const mockEnv = {
  R2_ACCOUNT_ID: 'test-account-id',
  R2_ACCESS_KEY_ID: 'test-access-key',
  R2_SECRET_ACCESS_KEY: 'test-secret-key',
  R2_BUCKET_NAME: 'test-bucket',
  R2_PUBLIC_URL: 'https://images.footprint.co.il',
};

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.entries(mockEnv).forEach(([key, value]) => {
      vi.stubEnv(key, value);
    });

    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user123' } },
      error: null,
    });

    // Set up default mock returns
    mockValidateImage.mockResolvedValue({ valid: true, format: 'jpeg' });
    mockOptimizeForPrint.mockResolvedValue(Buffer.from('optimized'));
    mockConvertToJpeg.mockResolvedValue(Buffer.from('converted'));
    mockGetUploadUrl.mockResolvedValue({
      uploadUrl: 'https://presigned-url.example.com/upload',
      key: 'uploads/user123/1234-uuid.jpg',
      publicUrl: 'https://images.footprint.co.il/uploads/user123/1234-uuid.jpg',
      expiresIn: 3600,
    });
    mockUploadToR2.mockResolvedValue({
      key: 'uploads/user123/1234-uuid.jpg',
      publicUrl: 'https://images.footprint.co.il/uploads/user123/1234-uuid.jpg',
      size: 1024,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Presigned URL mode', () => {
    it('should return presigned URL for valid request', async () => {
      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'presigned',
          fileName: 'photo.jpg',
          contentType: 'image/jpeg',
          fileSize: 5 * 1024 * 1024,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.uploadUrl).toBeDefined();
      expect(data.publicUrl).toBeDefined();
      expect(data.key).toBeDefined();
    });

    it('should reject files over 20MB', async () => {
      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'presigned',
          fileName: 'large-photo.jpg',
          contentType: 'image/jpeg',
          fileSize: 25 * 1024 * 1024,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('too large');
    });

    it('should reject unsupported file types', async () => {
      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'presigned',
          fileName: 'document.pdf',
          contentType: 'application/pdf',
          fileSize: 1024,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Unsupported');
    });

    it('should accept PNG files', async () => {
      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'presigned',
          fileName: 'image.png',
          contentType: 'image/png',
          fileSize: 1024,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should accept HEIC files', async () => {
      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'presigned',
          fileName: 'image.heic',
          contentType: 'image/heic',
          fileSize: 1024,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });

    it('should accept WebP files', async () => {
      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'presigned',
          fileName: 'image.webp',
          contentType: 'image/webp',
          fileSize: 1024,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Direct upload mode', () => {
    it('should upload and optimize image directly', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      const formData = new FormData();
      formData.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), 'photo.jpg');
      formData.append('mode', 'direct');

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.publicUrl).toBeDefined();
      expect(data.key).toBeDefined();
    });

    it('should optimize image for print', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      const formData = new FormData();
      formData.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), 'photo.jpg');
      formData.append('mode', 'direct');
      formData.append('optimize', 'true');

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockOptimizeForPrint).toHaveBeenCalled();
    });

    it('should convert HEIC to JPEG', async () => {
      const imageBuffer = Buffer.from('fake-heic-data');
      const formData = new FormData();
      formData.append('file', new Blob([imageBuffer], { type: 'image/heic' }), 'photo.heic');
      formData.append('mode', 'direct');

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      await POST(request);

      expect(mockConvertToJpeg).toHaveBeenCalled();
    });

    it('should reject invalid images', async () => {
      mockValidateImage.mockResolvedValue({
        valid: false,
        error: 'Invalid image format',
        code: 'INVALID_IMAGE',
      });

      const imageBuffer = Buffer.from('not-an-image');
      const formData = new FormData();
      formData.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), 'fake.jpg');
      formData.append('mode', 'direct');

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('Authentication', () => {
    it('should require authentication', async () => {
      // Mock unauthenticated user
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'presigned',
          fileName: 'photo.jpg',
          contentType: 'image/jpeg',
          fileSize: 1024,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe('Error handling', () => {
    it('should handle missing required fields', async () => {
      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'presigned',
          // Missing fileName, contentType, fileSize
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should handle R2 upload errors', async () => {
      mockGetUploadUrl.mockRejectedValue(new Error('R2 error'));

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'presigned',
          fileName: 'photo.jpg',
          contentType: 'image/jpeg',
          fileSize: 1024,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it('should handle invalid JSON body', async () => {
      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('Response format', () => {
    it('should return proper JSON response for presigned mode', async () => {
      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'presigned',
          fileName: 'photo.jpg',
          contentType: 'image/jpeg',
          fileSize: 1024,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('uploadUrl');
      expect(data).toHaveProperty('publicUrl');
      expect(data).toHaveProperty('key');
      expect(data).toHaveProperty('expiresIn');
    });

    it('should return proper JSON response for direct mode', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      const formData = new FormData();
      formData.append('file', new Blob([imageBuffer], { type: 'image/jpeg' }), 'photo.jpg');
      formData.append('mode', 'direct');

      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('publicUrl');
      expect(data).toHaveProperty('key');
      expect(data).toHaveProperty('size');
    });
  });
});
