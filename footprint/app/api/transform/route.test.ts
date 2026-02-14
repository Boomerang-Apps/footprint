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
const mockTransformImage = vi.fn();
const mockUploadToSupabase = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/ai', () => ({
  transformImage: (...args: unknown[]) => mockTransformImage(...args),
  isValidStyle: (style: string) =>
    [
      'original',
      'watercolor',
      'line_art',
      'line_art_watercolor',
      'oil_painting',
      'avatar_cartoon',
    ].includes(style),
  ALLOWED_STYLES: [
    'original',
    'watercolor',
    'line_art',
    'line_art_watercolor',
    'oil_painting',
    'avatar_cartoon',
  ],
}));

vi.mock('@/lib/storage/supabase-storage', () => ({
  uploadToSupabase: (...args: unknown[]) => mockUploadToSupabase(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      getUser: () => mockGetUser(),
    },
  }),
}));

// Mock database functions
vi.mock('@/lib/db/transformations', () => ({
  createTransformation: () =>
    Promise.resolve({ id: 'test-transformation-id' }),
  startTransformation: () => Promise.resolve(),
  completeTransformation: () => Promise.resolve(),
  failTransformation: () => Promise.resolve(),
  findExistingTransformation: () => Promise.resolve(null),
}));

// Mock style references
vi.mock('@/lib/ai/style-references', () => ({
  getStyleReferences: () => [],
  hasStyleReferences: () => false,
}));

// Mock nano-banana reference loading
vi.mock('@/lib/ai/nano-banana', () => ({
  loadReferenceImages: () => Promise.resolve([]),
}));

// Mock transformation cache
const mockGetCachedTransformation = vi.fn();
const mockSetCachedTransformation = vi.fn();
vi.mock('@/lib/ai/transformation-cache', () => ({
  getCachedTransformation: (...args: unknown[]) => mockGetCachedTransformation(...args),
  setCachedTransformation: (...args: unknown[]) => mockSetCachedTransformation(...args),
}));

// Mock concurrency limit
const mockAcquireConcurrencySlot = vi.fn();
const mockReleaseConcurrencySlot = vi.fn();
vi.mock('@/lib/ai/concurrency-limit', () => ({
  acquireConcurrencySlot: (...args: unknown[]) => mockAcquireConcurrencySlot(...args),
  releaseConcurrencySlot: (...args: unknown[]) => mockReleaseConcurrencySlot(...args),
}));

// Mock global fetch for fetching transformed images
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock environment variables
const mockEnv = {
  REPLICATE_API_TOKEN: 'test-token',
  GOOGLE_AI_API_KEY: 'test-google-key',
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
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

    // Default mock returns - transformImage returns a result object
    mockTransformImage.mockResolvedValue({
      imageBase64: 'base64encodedimage',
      mimeType: 'image/png',
      provider: 'nano-banana',
      tokensUsed: 100,
      estimatedCost: 0.01,
      processingTimeMs: 5000,
    });
    mockUploadToSupabase.mockResolvedValue({
      key: 'transformed/user123/abc123.png',
      publicUrl: 'https://images.footprint.co.il/transformed/user123/abc123.png',
      size: 512000,
    });

    // Mock fetch for downloading transformed images from Replicate
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
    });

    // Default: no Redis cache hit, concurrency allowed
    mockGetCachedTransformation.mockResolvedValue(null);
    mockSetCachedTransformation.mockResolvedValue(undefined);
    mockAcquireConcurrencySlot.mockResolvedValue({ allowed: true, currentCount: 1 });
    mockReleaseConcurrencySlot.mockResolvedValue(undefined);
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
          style: 'watercolor',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transformedUrl).toBeDefined();
      expect(data.style).toBe('watercolor');
      expect(data.processingTime).toBeDefined();
    });

    it('should call transformImage with correct parameters', async () => {
      const imageUrl = 'https://images.footprint.co.il/uploads/user123/photo.jpg';
      const style = 'watercolor';

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, style }),
      });

      await POST(request);

      expect(mockTransformImage).toHaveBeenCalledWith(
        imageUrl,
        style,
        expect.objectContaining({ provider: 'nano-banana' })
      );
    });

    it('should upload transformed image to Supabase Storage', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'line_art',
        }),
      });

      await POST(request);

      expect(mockUploadToSupabase).toHaveBeenCalled();
    });

    it('should return Supabase Storage URL instead of provider URL', async () => {
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
    });

    it('should support all 6 styles', async () => {
      const styles = [
        'original',
        'watercolor',
        'line_art',
        'line_art_watercolor',
        'oil_painting',
        'avatar_cartoon',
      ];

      for (const style of styles) {
        vi.clearAllMocks();
        mockGetUser.mockResolvedValue({
          data: { user: { id: 'user123' } },
          error: null,
        });
        mockTransformImage.mockResolvedValue({
          imageBase64: 'base64encodedimage',
          mimeType: 'image/png',
          provider: 'nano-banana',
          tokensUsed: 100,
          estimatedCost: 0.01,
          processingTimeMs: 5000,
        });
        mockUploadToSupabase.mockResolvedValue({
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
    it('should allow anonymous users to transform images', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'watercolor',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Route now allows anonymous users with userId = 'anonymous'
      expect(response.status).toBe(200);
      expect(data.transformedUrl).toBeDefined();
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
          style: 'watercolor',
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
          style: 'watercolor',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid');
    });
  });

  describe('Error handling', () => {
    it('should return 500 when AI transformation fails', async () => {
      mockTransformImage.mockRejectedValue(new Error('AI API error'));

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'watercolor',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('transformation failed');
    });

    it('should return 500 when storage upload fails', async () => {
      mockUploadToSupabase.mockRejectedValue(new Error('Storage upload error'));

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'watercolor',
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
          style: 'oil_painting',
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
          style: 'avatar_cartoon',
        }),
      });

      const response = await POST(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('Redis caching (AC-003, AC-004)', () => {
    it('should return cached result from Redis when available', async () => {
      mockGetCachedTransformation.mockResolvedValue({
        url: 'https://images.footprint.co.il/transformed/cached.png',
        provider: 'nano-banana',
        transformationId: 'cached-tx-id',
      });

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'watercolor',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cached).toBe(true);
      expect(data.transformedUrl).toBe('https://images.footprint.co.il/transformed/cached.png');
      expect(data.transformationId).toBe('cached-tx-id');
      // Should NOT call AI transform
      expect(mockTransformImage).not.toHaveBeenCalled();
    });

    it('should fall through to AI when Redis misses', async () => {
      mockGetCachedTransformation.mockResolvedValue(null);

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'watercolor',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockTransformImage).toHaveBeenCalled();
    });

    it('should populate Redis cache after successful transformation', async () => {
      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'watercolor',
        }),
      });

      await POST(request);

      expect(mockSetCachedTransformation).toHaveBeenCalledWith(
        expect.any(String),
        'watercolor',
        expect.objectContaining({
          url: expect.any(String),
          provider: 'nano-banana',
        })
      );
    });
  });

  describe('Concurrency limiting (AC-006)', () => {
    it('should return 429 when concurrent limit exceeded', async () => {
      mockAcquireConcurrencySlot.mockResolvedValue({ allowed: false, currentCount: 3 });

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'watercolor',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.code).toBe('CONCURRENT_LIMIT');
      expect(mockTransformImage).not.toHaveBeenCalled();
    });

    it('should allow when under concurrent limit', async () => {
      mockAcquireConcurrencySlot.mockResolvedValue({ allowed: true, currentCount: 1 });

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'watercolor',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockTransformImage).toHaveBeenCalled();
    });

    it('should release concurrency slot even when transformation fails', async () => {
      mockTransformImage.mockRejectedValue(new Error('AI API error'));

      const request = new Request('http://localhost/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/uploads/user123/photo.jpg',
          style: 'watercolor',
        }),
      });

      await POST(request);

      expect(mockReleaseConcurrencySlot).toHaveBeenCalled();
    });
  });
});
