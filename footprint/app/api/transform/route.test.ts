import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => undefined,
    set: () => {},
  }),
}));

// Mock dependencies
const mockTransformWithRetry = vi.fn();
const mockUploadToR2 = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/ai/replicate', () => ({
  transformWithRetry: (...args: unknown[]) => mockTransformWithRetry(...args),
  isValidStyle: (style: string) =>
    [
      'pop_art',
      'watercolor',
      'line_art',
      'oil_painting',
      'romantic',
      'comic_book',
      'vintage',
      'original_enhanced',
    ].includes(style),
  ALLOWED_STYLES: [
    'pop_art',
    'watercolor',
    'line_art',
    'oil_painting',
    'romantic',
    'comic_book',
    'vintage',
    'original_enhanced',
  ],
}));

vi.mock('@/lib/storage/r2', () => ({
  uploadToR2: (...args: unknown[]) => mockUploadToR2(...args),
  getPublicUrl: (key: string) => `https://images.footprint.co.il/${key}`,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: () => mockGetUser(),
    },
  }),
}));

// Mock global fetch for fetching transformed images
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock environment variables
const mockEnv = {
  REPLICATE_API_TOKEN: 'test-token',
  R2_ACCOUNT_ID: 'test-account-id',
  R2_ACCESS_KEY_ID: 'test-access-key',
  R2_SECRET_ACCESS_KEY: 'test-secret-key',
  R2_BUCKET_NAME: 'test-bucket',
  R2_PUBLIC_URL: 'https://images.footprint.co.il',
};

describe('POST /api/transform', () => {
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

    // Default mock returns
    mockTransformWithRetry.mockResolvedValue(
      'https://replicate.delivery/output/transformed.png'
    );
    mockUploadToR2.mockResolvedValue({
      key: 'transformed/user123/abc123.png',
      publicUrl: 'https://images.footprint.co.il/transformed/user123/abc123.png',
      size: 512000,
    });

    // Mock fetch for downloading transformed images from Replicate
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Successful transformations', () => {
    it('should transform image with valid style', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'pop_art',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transformedUrl).toBeDefined();
      expect(data.style).toBe('pop_art');
      expect(data.processingTime).toBeDefined();
    });

    it('should call Replicate with correct parameters', async () => {
      const imageUrl = 'https://images.footprint.co.il/uploads/user123/photo.jpg';
      const style = 'watercolor';

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, style }),
      });

      await POST(request);

      expect(mockTransformWithRetry).toHaveBeenCalledWith(imageUrl, style);
    });

    it('should upload transformed image to R2', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'line_art',
        }),
      });

      await POST(request);

      expect(mockUploadToR2).toHaveBeenCalled();
    });

    it('should return R2 URL instead of Replicate URL', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'oil_painting',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.transformedUrl).toContain('images.footprint.co.il');
      expect(data.transformedUrl).not.toContain('replicate.delivery');
    });

    it('should support all 8 styles', async () => {
      const styles = [
        'pop_art',
        'watercolor',
        'line_art',
        'oil_painting',
        'romantic',
        'comic_book',
        'vintage',
        'original_enhanced',
      ];

      for (const style of styles) {
        vi.clearAllMocks();
        mockGetUser.mockResolvedValue({
          data: { user: { id: 'user123' } },
          error: null,
        });
        mockTransformWithRetry.mockResolvedValue(
          'https://replicate.delivery/output/transformed.png'
        );
        mockUploadToR2.mockResolvedValue({
          key: `transformed/user123/${style}.png`,
          publicUrl: `https://images.footprint.co.il/transformed/user123/${style}.png`,
          size: 512000,
        });
        mockFetch.mockResolvedValue({
          ok: true,
          arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
        });

        const request = new Request('http://localhost/api/transform', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
            style,
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated users', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'pop_art',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });
  });

  describe('Validation', () => {
    it('should return 400 for invalid style', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'invalid_style',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid style');
    });

    it('should return 400 for missing imageUrl', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          style: 'pop_art',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('imageUrl');
    });

    it('should return 400 for missing style', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('style');
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid URL format', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'not-a-valid-url',
          style: 'pop_art',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid');
    });
  });

  describe('Error handling', () => {
    it('should return 500 when Replicate fails', async () => {
      mockTransformWithRetry.mockRejectedValue(new Error('Replicate API error'));

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'pop_art',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('transformation failed');
    });

    it('should return 500 when R2 upload fails', async () => {
      mockUploadToR2.mockRejectedValue(new Error('R2 upload error'));

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'pop_art',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('Response format', () => {
    it('should return correct response structure', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'romantic',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('transformedUrl');
      expect(data).toHaveProperty('style');
      expect(data).toHaveProperty('processingTime');
      expect(typeof data.processingTime).toBe('number');
    });

    it('should have correct content-type header', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'comic_book',
        }),
      });

      const response = await POST(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });
});
