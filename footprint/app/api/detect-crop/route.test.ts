/**
 * Smart Crop Detection API - TDD Tests
 *
 * Tests for the POST /api/detect-crop endpoint that provides
 * intelligent crop suggestions for uploaded images.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import sharp from 'sharp';

// Mock the faceDetection module
vi.mock('@/lib/image/faceDetection', () => ({
  getSuggestedCrops: vi.fn(),
  isValidAspectRatio: vi.fn((ratio: string) => {
    const validRatios = ['1:1', '4:5', '3:4', '16:9', '1:1.414'];
    return validRatios.includes(ratio);
  }),
  DEFAULT_ASPECT_RATIOS: ['1:1', '4:5', '3:4'],
}));

// Mock R2 storage for fetching images
vi.mock('@/lib/storage/r2', () => ({
  getImageFromR2: vi.fn(),
  isR2Url: vi.fn((url: string) => url.includes('r2.') || url.includes('footprint')),
}));

import { getSuggestedCrops, isValidAspectRatio } from '@/lib/image/faceDetection';
import { getImageFromR2, isR2Url } from '@/lib/storage/r2';

// Helper to create test image buffer
async function createTestImageBuffer(width: number = 800, height: number = 600): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .jpeg()
    .toBuffer();
}

// Helper to create JSON request
function createRequest(body: Record<string, unknown>): Request {
  return new Request('http://localhost:3000/api/detect-crop', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/detect-crop', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Reset isValidAspectRatio to default behavior
    vi.mocked(isValidAspectRatio).mockImplementation((ratio: string) => {
      const validRatios = ['1:1', '4:5', '3:4', '16:9', '1:1.414'];
      return validRatios.includes(ratio);
    });
  });

  describe('Request Validation', () => {
    it('should return 400 if imageUrl is missing', async () => {
      const request = createRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('imageUrl');
    });

    it('should return 400 if imageUrl is empty', async () => {
      const request = createRequest({ imageUrl: '' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('imageUrl');
    });

    it('should return 400 if imageUrl is not a string', async () => {
      const request = createRequest({ imageUrl: 123 });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('imageUrl');
    });

    it('should return 400 for invalid aspectRatios format', async () => {
      const request = createRequest({
        imageUrl: 'https://r2.footprint.co.il/test.jpg',
        aspectRatios: 'not-an-array',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('aspectRatios');
    });

    it('should return 400 if aspectRatios contains invalid values', async () => {
      const request = createRequest({
        imageUrl: 'https://r2.footprint.co.il/test.jpg',
        aspectRatios: ['1:1', 'invalid', '4:5'],
      });

      vi.mocked(isValidAspectRatio).mockImplementation((r) => r === '1:1' || r === '4:5');

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('invalid');
    });

    it('should accept valid request body', async () => {
      const imageBuffer = await createTestImageBuffer();

      vi.mocked(isR2Url).mockReturnValue(true);
      vi.mocked(getImageFromR2).mockResolvedValue(imageBuffer);
      vi.mocked(getSuggestedCrops).mockResolvedValue({
        imageWidth: 800,
        imageHeight: 600,
        crops: {
          '1:1': { region: { x: 100, y: 0, width: 600, height: 600 }, score: 0.85 },
        },
      });

      const request = createRequest({
        imageUrl: 'https://r2.footprint.co.il/test.jpg',
        aspectRatios: ['1:1'],
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Image Fetching', () => {
    it('should fetch image from R2 storage', async () => {
      const imageBuffer = await createTestImageBuffer();

      vi.mocked(isR2Url).mockReturnValue(true);
      vi.mocked(getImageFromR2).mockResolvedValue(imageBuffer);
      vi.mocked(getSuggestedCrops).mockResolvedValue({
        imageWidth: 800,
        imageHeight: 600,
        crops: {},
      });

      const request = createRequest({
        imageUrl: 'https://r2.footprint.co.il/images/test.jpg',
      });

      await POST(request);

      expect(getImageFromR2).toHaveBeenCalledWith('https://r2.footprint.co.il/images/test.jpg');
    });

    it('should return 404 if image not found in R2', async () => {
      vi.mocked(isR2Url).mockReturnValue(true);
      vi.mocked(getImageFromR2).mockRejectedValue(new Error('Image not found'));

      const request = createRequest({
        imageUrl: 'https://r2.footprint.co.il/nonexistent.jpg',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should return 400 for non-R2 URLs', async () => {
      vi.mocked(isR2Url).mockReturnValue(false);

      const request = createRequest({
        imageUrl: 'https://external-site.com/image.jpg',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('R2');
    });
  });

  describe('Crop Detection', () => {
    it('should call getSuggestedCrops with image buffer', async () => {
      const imageBuffer = await createTestImageBuffer();

      vi.mocked(isR2Url).mockReturnValue(true);
      vi.mocked(getImageFromR2).mockResolvedValue(imageBuffer);
      vi.mocked(getSuggestedCrops).mockResolvedValue({
        imageWidth: 800,
        imageHeight: 600,
        crops: {},
      });

      const request = createRequest({
        imageUrl: 'https://r2.footprint.co.il/test.jpg',
      });

      await POST(request);

      expect(getSuggestedCrops).toHaveBeenCalledWith(
        imageBuffer,
        expect.objectContaining({})
      );
    });

    it('should pass custom aspectRatios to getSuggestedCrops', async () => {
      const imageBuffer = await createTestImageBuffer();

      vi.mocked(isR2Url).mockReturnValue(true);
      vi.mocked(getImageFromR2).mockResolvedValue(imageBuffer);
      vi.mocked(getSuggestedCrops).mockResolvedValue({
        imageWidth: 800,
        imageHeight: 600,
        crops: {},
      });

      const request = createRequest({
        imageUrl: 'https://r2.footprint.co.il/test.jpg',
        aspectRatios: ['16:9', '1:1'],
      });

      await POST(request);

      expect(getSuggestedCrops).toHaveBeenCalledWith(
        imageBuffer,
        expect.objectContaining({
          aspectRatios: ['16:9', '1:1'],
        })
      );
    });

    it('should return 500 if crop detection fails', async () => {
      const imageBuffer = await createTestImageBuffer();

      vi.mocked(isR2Url).mockReturnValue(true);
      vi.mocked(getImageFromR2).mockResolvedValue(imageBuffer);
      vi.mocked(getSuggestedCrops).mockRejectedValue(new Error('Processing error'));

      const request = createRequest({
        imageUrl: 'https://r2.footprint.co.il/test.jpg',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('Response Format', () => {
    it('should return crop suggestions in correct format', async () => {
      const imageBuffer = await createTestImageBuffer();

      vi.mocked(isR2Url).mockReturnValue(true);
      vi.mocked(getImageFromR2).mockResolvedValue(imageBuffer);
      vi.mocked(getSuggestedCrops).mockResolvedValue({
        imageWidth: 800,
        imageHeight: 600,
        crops: {
          '1:1': { region: { x: 100, y: 0, width: 600, height: 600 }, score: 0.85 },
          '4:5': { region: { x: 160, y: 0, width: 480, height: 600 }, score: 0.78 },
        },
      });

      const request = createRequest({
        imageUrl: 'https://r2.footprint.co.il/test.jpg',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.imageWidth).toBe(800);
      expect(data.imageHeight).toBe(600);
      expect(data.crops).toBeDefined();
      expect(data.crops['1:1']).toEqual({
        region: { x: 100, y: 0, width: 600, height: 600 },
        score: 0.85,
      });
    });

    it('should include success flag in response', async () => {
      const imageBuffer = await createTestImageBuffer();

      vi.mocked(isR2Url).mockReturnValue(true);
      vi.mocked(getImageFromR2).mockResolvedValue(imageBuffer);
      vi.mocked(getSuggestedCrops).mockResolvedValue({
        imageWidth: 800,
        imageHeight: 600,
        crops: {},
      });

      const request = createRequest({
        imageUrl: 'https://r2.footprint.co.il/test.jpg',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return proper error format', async () => {
      const request = createRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
      expect(typeof data.error).toBe('string');
    });

    it('should handle malformed JSON body', async () => {
      const request = new Request('http://localhost:3000/api/detect-crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'not valid json{',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});
