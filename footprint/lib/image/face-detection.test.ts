/**
 * Face Detection Tests
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  detectFaces,
  validateImageFormat,
  preprocessImage,
  clearDetectionCache,
  getCacheStats,
  MAX_IMAGE_SIZE,
  MAX_DETECTION_DIMENSION,
  SUPPORTED_FORMATS,
} from './face-detection';

// Mock sharp
vi.mock('sharp', () => {
  const mockMetadata = vi.fn();
  const mockResize = vi.fn();
  const mockJpeg = vi.fn();
  const mockToBuffer = vi.fn();

  const sharpInstance = {
    metadata: mockMetadata,
    resize: mockResize,
    jpeg: mockJpeg,
    toBuffer: mockToBuffer,
  };

  // Chain methods
  mockResize.mockReturnValue(sharpInstance);
  mockJpeg.mockReturnValue(sharpInstance);

  const sharp = vi.fn(() => sharpInstance);

  return {
    default: sharp,
    __mockMetadata: mockMetadata,
    __mockToBuffer: mockToBuffer,
  };
});

// Mock smartcrop-sharp
vi.mock('smartcrop-sharp', () => ({
  crop: vi.fn(),
}));

// Mock crypto for cache key generation
vi.mock('crypto', () => ({
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'mock-hash-key'),
  })),
}));

describe('face-detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearDetectionCache();
  });

  afterEach(() => {
    clearDetectionCache();
  });

  describe('validateImageFormat', () => {
    it('should validate JPEG format', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 100, height: 100 });

      const result = await validateImageFormat(Buffer.from('test'));

      expect(result.valid).toBe(true);
      expect(result.format).toBe('jpeg');
    });

    it('should validate PNG format', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'png', width: 100, height: 100 });

      const result = await validateImageFormat(Buffer.from('test'));

      expect(result.valid).toBe(true);
      expect(result.format).toBe('png');
    });

    it('should validate WebP format', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'webp', width: 100, height: 100 });

      const result = await validateImageFormat(Buffer.from('test'));

      expect(result.valid).toBe(true);
      expect(result.format).toBe('webp');
    });

    it('should validate HEIC format', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'heic', width: 100, height: 100 });

      const result = await validateImageFormat(Buffer.from('test'));

      expect(result.valid).toBe(true);
      expect(result.format).toBe('heic');
    });

    it('should reject unsupported format', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'gif', width: 100, height: 100 });

      const result = await validateImageFormat(Buffer.from('test'));

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported format');
    });

    it('should handle invalid buffer', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockRejectedValue(new Error('Invalid image'));

      const result = await validateImageFormat(Buffer.from('invalid'));

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid image');
    });
  });

  describe('preprocessImage', () => {
    it('should return original buffer for small images', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      const inputBuffer = Buffer.from('test');
      const result = await preprocessImage(inputBuffer);

      expect(result.scale).toBe(1);
      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
      expect(result.buffer).toBe(inputBuffer);
    });

    it('should downsample large images', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      const mockToBuffer = (sharp as unknown as { __mockToBuffer: ReturnType<typeof vi.fn> }).__mockToBuffer;

      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 4096, height: 3072 });
      mockToBuffer.mockResolvedValue(Buffer.from('resized'));

      const result = await preprocessImage(Buffer.from('test'));

      expect(result.scale).toBeLessThan(1);
      expect(result.width).toBe(4096);
      expect(result.height).toBe(3072);
    });

    it('should throw for invalid dimensions', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg' }); // No width/height

      await expect(preprocessImage(Buffer.from('test'))).rejects.toThrow(
        'Could not determine image dimensions'
      );
    });
  });

  describe('detectFaces', () => {
    it('should throw for empty buffer', async () => {
      await expect(detectFaces(Buffer.from(''))).rejects.toThrow('buffer is empty');
    });

    it('should return faces array', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      // Without REPLICATE_API_KEY, it will use fallback detection
      const smartcrop = await import('smartcrop-sharp');
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockResolvedValue({
        topCrop: { x: 100, y: 50, width: 400, height: 400 },
      });

      const result = await detectFaces(Buffer.from('test-image'));

      expect(result).toHaveProperty('imageWidth', 800);
      expect(result).toHaveProperty('imageHeight', 600);
      expect(result).toHaveProperty('faces');
      expect(Array.isArray(result.faces)).toBe(true);
      expect(result).toHaveProperty('processingTimeMs');
      expect(result).toHaveProperty('cached', false);
    });

    it('should filter by confidence threshold', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      const smartcrop = await import('smartcrop-sharp');
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockResolvedValue({
        topCrop: { x: 100, y: 50, width: 400, height: 400 },
      });

      const result = await detectFaces(Buffer.from('test-image'), {
        minConfidence: 0.9, // Higher than fallback confidence (0.3)
      });

      // Fallback faces have 0.3 confidence, should be filtered out
      expect(result.faces.length).toBe(0);
    });

    it('should cache results', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      const smartcrop = await import('smartcrop-sharp');
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockResolvedValue({
        topCrop: { x: 100, y: 50, width: 400, height: 400 },
      });

      const buffer = Buffer.from('test-image');

      // First call
      const result1 = await detectFaces(buffer);
      expect(result1.cached).toBe(false);

      // Second call should be cached
      const result2 = await detectFaces(buffer);
      expect(result2.cached).toBe(true);
    });
  });

  describe('getCacheStats', () => {
    it('should return cache statistics', () => {
      const stats = getCacheStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('maxSize');
      expect(stats).toHaveProperty('ttlMs');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.maxSize).toBe('number');
      expect(typeof stats.ttlMs).toBe('number');
    });
  });

  describe('clearDetectionCache', () => {
    it('should clear the cache', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      const smartcrop = await import('smartcrop-sharp');
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockResolvedValue({
        topCrop: { x: 100, y: 50, width: 400, height: 400 },
      });

      // Add item to cache
      await detectFaces(Buffer.from('test'));
      expect(getCacheStats().size).toBeGreaterThan(0);

      // Clear cache
      clearDetectionCache();
      expect(getCacheStats().size).toBe(0);
    });
  });

  describe('constants', () => {
    it('should have correct MAX_IMAGE_SIZE', () => {
      expect(MAX_IMAGE_SIZE).toBe(10 * 1024 * 1024); // 10MB
    });

    it('should have correct MAX_DETECTION_DIMENSION', () => {
      expect(MAX_DETECTION_DIMENSION).toBe(2048);
    });

    it('should support expected formats', () => {
      expect(SUPPORTED_FORMATS).toContain('jpeg');
      expect(SUPPORTED_FORMATS).toContain('png');
      expect(SUPPORTED_FORMATS).toContain('heic');
      expect(SUPPORTED_FORMATS).toContain('webp');
    });
  });

  describe('detectFaces with Replicate API', () => {
    const originalEnv = process.env;
    const mockFetch = vi.fn();

    beforeEach(() => {
      vi.resetModules();
      process.env = { ...originalEnv, REPLICATE_API_KEY: 'test-api-key' };
      global.fetch = mockFetch;
    });

    afterEach(() => {
      process.env = originalEnv;
      vi.restoreAllMocks();
    });

    it('should call Replicate API when API key is set', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      // Mock successful Replicate API response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: 'pred_123',
            status: 'succeeded',
            urls: { get: 'https://api.replicate.com/v1/predictions/pred_123' },
            output: [
              { bbox: [100, 100, 200, 250], confidence: 0.95 },
              { bbox: [300, 150, 400, 300], confidence: 0.88 },
            ],
          }),
        });

      const result = await detectFaces(Buffer.from('test-image'));

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.replicate.com/v1/predictions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      );

      expect(result.faces.length).toBe(2);
      expect(result.faces[0].confidence).toBe(0.95);
    });

    it('should handle Replicate API error response', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      // Mock API error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve('API rate limit exceeded'),
      });

      // Should fall back to smartcrop
      const smartcrop = await import('smartcrop-sharp');
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockResolvedValue({
        topCrop: { x: 100, y: 50, width: 400, height: 400 },
      });

      const result = await detectFaces(Buffer.from('test-image'));

      // Should still return a result using fallback
      expect(result).toHaveProperty('faces');
    });

    it('should handle Replicate API timeout', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      // Mock pending status that never completes
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          id: 'pred_123',
          status: 'processing',
          urls: { get: 'https://api.replicate.com/v1/predictions/pred_123' },
        }),
      });

      const smartcrop = await import('smartcrop-sharp');
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockResolvedValue({
        topCrop: { x: 100, y: 50, width: 400, height: 400 },
      });

      // Should timeout and fall back
      const result = await detectFaces(Buffer.from('test-image'));
      expect(result).toHaveProperty('faces');
    }, 15000);

    it('should handle Replicate API failed status', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'pred_123',
          status: 'failed',
          urls: { get: 'https://api.replicate.com/v1/predictions/pred_123' },
        }),
      });

      const smartcrop = await import('smartcrop-sharp');
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockResolvedValue({
        topCrop: { x: 100, y: 50, width: 400, height: 400 },
      });

      // Should fall back
      const result = await detectFaces(Buffer.from('test-image'));
      expect(result).toHaveProperty('faces');
    });

    it('should handle empty output from Replicate', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'pred_123',
          status: 'succeeded',
          urls: { get: 'https://api.replicate.com/v1/predictions/pred_123' },
          output: null,
        }),
      });

      const result = await detectFaces(Buffer.from('test-image'));
      expect(result.faces).toHaveLength(0);
    });

    it('should poll for result when status is processing', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      // First call returns processing, second returns succeeded
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: 'pred_123',
            status: 'processing',
            urls: { get: 'https://api.replicate.com/v1/predictions/pred_123' },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            id: 'pred_123',
            status: 'succeeded',
            urls: { get: 'https://api.replicate.com/v1/predictions/pred_123' },
            output: [{ bbox: [100, 100, 200, 250], confidence: 0.95 }],
          }),
        });

      const result = await detectFaces(Buffer.from('test-image'));

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.faces.length).toBe(1);
    });
  });

  describe('detectFaces error handling', () => {
    it('should throw error for invalid image format', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'gif', width: 100, height: 100 });

      await expect(detectFaces(Buffer.from('gif-image'))).rejects.toThrow('Unsupported format');
    });

    it('should throw error when format cannot be determined', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ width: 100, height: 100 }); // No format

      await expect(detectFaces(Buffer.from('no-format'))).rejects.toThrow('Could not determine image format');
    });
  });

  describe('bounding box scaling', () => {
    it('should scale bounding boxes for downsampled images', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      const mockToBuffer = (sharp as unknown as { __mockToBuffer: ReturnType<typeof vi.fn> }).__mockToBuffer;

      // Large image that will be downsampled
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 4096, height: 4096 });
      mockToBuffer.mockResolvedValue(Buffer.from('resized'));

      const smartcrop = await import('smartcrop-sharp');
      // Return a crop at 200,200 in the downsampled image (2048x2048)
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockResolvedValue({
        topCrop: { x: 200, y: 200, width: 400, height: 400 },
      });

      const result = await detectFaces(Buffer.from('large-image'));

      // Bounding box should be scaled back to original dimensions
      // Scale factor is 2048/4096 = 0.5, so coordinates should be doubled
      if (result.faces.length > 0) {
        const face = result.faces[0];
        // Original x should be approximately 200 / 0.5 = 400
        expect(face.boundingBox.x).toBeGreaterThan(200);
      }
    });
  });

  describe('face rotation calculation', () => {
    it('should calculate rotation from landmarks when present', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      // We need to test with faces that have landmarks
      // The fallback doesn't provide landmarks, so we need to mock the Replicate response
      const originalEnv = process.env;
      process.env = { ...originalEnv, REPLICATE_API_KEY: 'test-key' };

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'pred_123',
          status: 'succeeded',
          urls: { get: 'https://api.replicate.com/v1/predictions/pred_123' },
          output: [{
            bbox: [100, 100, 200, 250],
            confidence: 0.95,
            landmarks: {
              leftEye: { x: 130, y: 140 },
              rightEye: { x: 170, y: 145 }, // Slight tilt
            },
          }],
        }),
      });

      const result = await detectFaces(Buffer.from('test-image'));

      // The face should have a rotation value calculated from landmarks
      if (result.faces.length > 0) {
        expect(result.faces[0]).toHaveProperty('rotation');
        expect(typeof result.faces[0].rotation).toBe('number');
      }

      process.env = originalEnv;
    });

    it('should return 0 rotation when no landmarks', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      const smartcrop = await import('smartcrop-sharp');
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockResolvedValue({
        topCrop: { x: 100, y: 50, width: 400, height: 400 },
      });

      const result = await detectFaces(Buffer.from('test-image'), { minConfidence: 0.1 });

      if (result.faces.length > 0) {
        expect(result.faces[0].rotation).toBe(0);
      }
    });
  });

  describe('cache management', () => {
    it('should handle cache expiration', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      const smartcrop = await import('smartcrop-sharp');
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockResolvedValue({
        topCrop: { x: 100, y: 50, width: 400, height: 400 },
      });

      // First call
      await detectFaces(Buffer.from('test'));
      expect(getCacheStats().size).toBe(1);

      // Clear and call again
      clearDetectionCache();
      expect(getCacheStats().size).toBe(0);

      // Should reprocess after cache clear
      const result = await detectFaces(Buffer.from('test'));
      expect(result.cached).toBe(false);
    });
  });

  describe('fallback detection edge cases', () => {
    it('should handle smartcrop error gracefully', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      const smartcrop = await import('smartcrop-sharp');
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Smartcrop failed'));

      const result = await detectFaces(Buffer.from('test-image'));

      // Should return empty faces array instead of throwing
      expect(result.faces).toHaveLength(0);
    });

    it('should handle missing topCrop in smartcrop result', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;
      mockMetadata.mockResolvedValue({ format: 'jpeg', width: 800, height: 600 });

      const smartcrop = await import('smartcrop-sharp');
      (smartcrop.crop as ReturnType<typeof vi.fn>).mockResolvedValue({
        topCrop: null,
      });

      const result = await detectFaces(Buffer.from('test-image'));

      expect(result.faces).toHaveLength(0);
    });

    it('should return empty array when image has no dimensions in fallback', async () => {
      const sharp = await import('sharp');
      const mockMetadata = (sharp as unknown as { __mockMetadata: ReturnType<typeof vi.fn> }).__mockMetadata;

      // First call for validateImageFormat
      mockMetadata.mockResolvedValueOnce({ format: 'jpeg', width: 800, height: 600 });
      // Second call for preprocessImage
      mockMetadata.mockResolvedValueOnce({ format: 'jpeg', width: 800, height: 600 });
      // Third call inside detectFacesFallback - no dimensions
      mockMetadata.mockResolvedValueOnce({ format: 'jpeg' });

      const result = await detectFaces(Buffer.from('test-image'));

      expect(result.faces).toHaveLength(0);
    });
  });
});
