import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

// Mock next/headers before any imports use it
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => undefined,
    set: () => {},
  }),
}));

// Mock dependencies
const mockGetUploadUrl = vi.fn();
const mockUploadToSupabase = vi.fn();
const mockValidateImage = vi.fn();
const mockOptimizeForPrint = vi.fn();
const mockConvertToJpeg = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/storage/supabase-storage', () => ({
  getUploadUrl: (...args: unknown[]) => mockGetUploadUrl(...args),
  uploadToSupabase: (...args: unknown[]) => mockUploadToSupabase(...args),
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

// Mock rate limiting to skip Upstash Redis in tests
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
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
    mockUploadToSupabase.mockResolvedValue({
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

  describe('Authentication', () => {
    it('should allow anonymous uploads when user is not authenticated', async () => {
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
      // Route allows anonymous uploads (falls back to 'anonymous' userId)
      expect(response.status).toBe(200);
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

    it('should reject invalid content type', async () => {
      const request = new Request('http://localhost/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: 'some text data',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid content type');
    });
  });

  describe('Direct upload mode', () => {
    // Helper to create a mock file with arrayBuffer
    const createMockFile = (data: Buffer, name: string, type: string) => ({
      name,
      type,
      arrayBuffer: () => Promise.resolve(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)),
      [Symbol.toStringTag]: 'File',
    });

    // Helper to create a mock blob with arrayBuffer
    const createMockBlob = (data: Buffer, type: string) => ({
      type,
      arrayBuffer: () => Promise.resolve(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)),
      [Symbol.toStringTag]: 'Blob',
    });

    it('should handle direct upload with valid image', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      const mockFile = createMockFile(imageBuffer, 'photo.jpg', 'image/jpeg');

      const mockFormData = {
        get: (key: string) => {
          if (key === 'file') return mockFile;
          if (key === 'optimize') return null;
          return null;
        },
      };

      const request = {
        headers: {
          get: (name: string) => name === 'content-type' ? 'multipart/form-data' : null,
        },
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.publicUrl).toBeDefined();
      expect(data.key).toBeDefined();
    });

    it('should optimize image when optimize flag is true', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      const mockFile = createMockFile(imageBuffer, 'photo.jpg', 'image/jpeg');

      const mockFormData = {
        get: (key: string) => {
          if (key === 'file') return mockFile;
          if (key === 'optimize') return 'true';
          return null;
        },
      };

      const request = {
        headers: {
          get: (name: string) => name === 'content-type' ? 'multipart/form-data' : null,
        },
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as unknown as Request;

      await POST(request);

      expect(mockOptimizeForPrint).toHaveBeenCalled();
    });

    it('should convert HEIC to JPEG', async () => {
      const imageBuffer = Buffer.from('fake-heic-data');
      const mockFile = createMockFile(imageBuffer, 'photo.heic', 'image/heic');

      const mockFormData = {
        get: (key: string) => {
          if (key === 'file') return mockFile;
          if (key === 'optimize') return null;
          return null;
        },
      };

      const request = {
        headers: {
          get: (name: string) => name === 'content-type' ? 'multipart/form-data' : null,
        },
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as unknown as Request;

      await POST(request);

      expect(mockConvertToJpeg).toHaveBeenCalled();
    });

    it('should reject when no file is provided', async () => {
      const mockFormData = {
        get: (key: string) => {
          if (key === 'file') return null;
          return null;
        },
      };

      const request = {
        headers: {
          get: (name: string) => name === 'content-type' ? 'multipart/form-data' : null,
        },
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('No file');
    });

    it('should reject invalid image', async () => {
      mockValidateImage.mockResolvedValue({
        valid: false,
        error: 'Invalid image format',
        code: 'INVALID_IMAGE',
      });

      const imageBuffer = Buffer.from('not-an-image');
      const mockFile = createMockFile(imageBuffer, 'fake.jpg', 'image/jpeg');

      const mockFormData = {
        get: (key: string) => {
          if (key === 'file') return mockFile;
          if (key === 'optimize') return null;
          return null;
        },
      };

      const request = {
        headers: {
          get: (name: string) => name === 'content-type' ? 'multipart/form-data' : null,
        },
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid image');
    });

    it('should handle invalid formData', async () => {
      const request = {
        headers: {
          get: (name: string) => name === 'content-type' ? 'multipart/form-data' : null,
        },
        formData: vi.fn().mockRejectedValue(new Error('Invalid form data')),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid form data');
    });

    it('should handle R2 upload errors in direct mode', async () => {
      mockUploadToSupabase.mockRejectedValue(new Error('R2 upload failed'));

      const imageBuffer = Buffer.from('fake-image-data');
      const mockFile = createMockFile(imageBuffer, 'photo.jpg', 'image/jpeg');

      const mockFormData = {
        get: (key: string) => {
          if (key === 'file') return mockFile;
          if (key === 'optimize') return null;
          return null;
        },
      };

      const request = {
        headers: {
          get: (name: string) => name === 'content-type' ? 'multipart/form-data' : null,
        },
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to upload');
    });

    it('should handle blob without name (uses default filename)', async () => {
      const imageBuffer = Buffer.from('fake-image-data');
      const mockBlob = createMockBlob(imageBuffer, 'image/jpeg');

      const mockFormData = {
        get: (key: string) => {
          if (key === 'file') return mockBlob;
          if (key === 'optimize') return null;
          return null;
        },
      };

      const request = {
        headers: {
          get: (name: string) => name === 'content-type' ? 'multipart/form-data' : null,
        },
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as unknown as Request;

      const response = await POST(request);

      expect(response.status).toBe(200);
      // uploadToSupabase should be called with default filename
      expect(mockUploadToSupabase).toHaveBeenCalledWith(
        expect.any(Buffer),
        'user123',
        'image.jpg',
        'image/jpeg'
      );
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
      const mockFile = {
        name: 'photo.jpg',
        type: 'image/jpeg',
        arrayBuffer: () => Promise.resolve(imageBuffer.buffer.slice(imageBuffer.byteOffset, imageBuffer.byteOffset + imageBuffer.byteLength)),
        [Symbol.toStringTag]: 'File',
      };

      const mockFormData = {
        get: (key: string) => {
          if (key === 'file') return mockFile;
          if (key === 'optimize') return null;
          return null;
        },
      };

      const request = {
        headers: {
          get: (name: string) => name === 'content-type' ? 'multipart/form-data' : null,
        },
        formData: vi.fn().mockResolvedValue(mockFormData),
      } as unknown as Request;

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('publicUrl');
      expect(data).toHaveProperty('key');
      expect(data).toHaveProperty('size');
    });
  });
});
