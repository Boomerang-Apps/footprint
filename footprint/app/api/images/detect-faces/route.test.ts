/**
 * Face Detection API Tests
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Hoist mock functions
const { mockGetUser, mockDetectFaces, mockValidateImageFormat, mockCalculateOptimalCrop } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockDetectFaces: vi.fn(),
  mockValidateImageFormat: vi.fn(),
  mockCalculateOptimalCrop: vi.fn(),
}));

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// Mock rate limit
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}));

// Mock face detection
vi.mock('@/lib/image/face-detection', () => ({
  detectFaces: mockDetectFaces,
  validateImageFormat: mockValidateImageFormat,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
}));

// Mock crop calculator
vi.mock('@/lib/image/crop-calculator', () => ({
  calculateOptimalCrop: mockCalculateOptimalCrop,
}));

// Mock R2 storage
vi.mock('@/lib/storage/r2', () => ({
  isR2Url: vi.fn((url: string) => url.includes('r2.footprint')),
  getImageFromR2: vi.fn(() => Buffer.from('test-image')),
}));

// Import after mocks
import { POST } from './route';

describe('POST /api/images/detect-faces', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default to authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null,
    });

    // Default successful validation
    mockValidateImageFormat.mockResolvedValue({ valid: true, format: 'jpeg' });

    // Default detection result
    mockDetectFaces.mockResolvedValue({
      imageWidth: 800,
      imageHeight: 600,
      faces: [
        {
          boundingBox: { x: 300, y: 200, width: 100, height: 120 },
          confidence: 0.9,
          rotation: 0,
        },
      ],
      processingTimeMs: 500,
      cached: false,
    });

    // Default crop result
    mockCalculateOptimalCrop.mockReturnValue({
      imageWidth: 800,
      imageHeight: 600,
      suggestedCrop: {
        region: { x: 100, y: 50, width: 600, height: 600 },
        score: 0.85,
        includesFaces: true,
        faceCount: 1,
      },
      suggestedRotation: 0,
      detectedFaces: [],
      targetAspectRatio: '1:1',
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({ image: 'https://r2.footprint.co.il/test.jpg' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.code).toBe('UNAUTHORIZED');
    });

    it('should accept authenticated requests', async () => {
      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({ image: 'https://r2.footprint.co.il/test.jpg' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Request Validation', () => {
    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: 'not json',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('INVALID_IMAGE');
    });

    it('should return 400 for missing image field', async () => {
      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('image is required');
    });

    it('should return 400 for empty image', async () => {
      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({ image: '   ' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('image cannot be empty');
    });

    it('should return 400 for invalid aspect ratio format', async () => {
      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({
          image: 'https://r2.footprint.co.il/test.jpg',
          aspectRatio: 'invalid',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('aspectRatio');
    });
  });

  describe('Face Detection', () => {
    it('should return face detection results', async () => {
      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({ image: 'https://r2.footprint.co.il/test.jpg' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.faceDetection).toBeDefined();
      expect(data.faceDetection.imageWidth).toBe(800);
      expect(data.faceDetection.imageHeight).toBe(600);
      expect(data.faceDetection.faces).toHaveLength(1);
      expect(data.faceDetection.faces[0].confidence).toBe(0.9);
    });

    it('should handle no faces detected', async () => {
      mockDetectFaces.mockResolvedValue({
        imageWidth: 800,
        imageHeight: 600,
        faces: [],
        processingTimeMs: 300,
        cached: false,
      });

      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({ image: 'https://r2.footprint.co.il/test.jpg' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.faceDetection.faces).toHaveLength(0);
    });

    it('should pass detection options', async () => {
      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({
          image: 'https://r2.footprint.co.il/test.jpg',
          options: {
            minConfidence: 0.7,
            maxFaces: 5,
          },
        }),
      });

      await POST(request);

      expect(mockDetectFaces).toHaveBeenCalledWith(
        expect.any(Buffer),
        expect.objectContaining({
          minConfidence: 0.7,
          maxFaces: 5,
        })
      );
    });
  });

  describe('Crop Calculation', () => {
    it('should include crop suggestion when aspect ratio provided', async () => {
      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({
          image: 'https://r2.footprint.co.il/test.jpg',
          aspectRatio: '1:1',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cropSuggestion).toBeDefined();
      expect(data.cropSuggestion.targetAspectRatio).toBe('1:1');
    });

    it('should not include crop suggestion without aspect ratio', async () => {
      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({ image: 'https://r2.footprint.co.il/test.jpg' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cropSuggestion).toBeUndefined();
    });
  });

  describe('Image Format Validation', () => {
    it('should return 400 for invalid image format', async () => {
      mockValidateImageFormat.mockResolvedValue({
        valid: false,
        error: 'Unsupported format: gif',
      });

      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({ image: 'https://r2.footprint.co.il/test.gif' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.code).toBe('INVALID_IMAGE');
    });
  });

  describe('Error Handling', () => {
    it('should handle detection failure', async () => {
      mockDetectFaces.mockRejectedValue(new Error('Detection service unavailable'));

      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({ image: 'https://r2.footprint.co.il/test.jpg' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.code).toBe('DETECTION_FAILED');
    });

    it('should handle timeout', async () => {
      mockDetectFaces.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 15000))
      );

      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({ image: 'https://r2.footprint.co.il/test.jpg' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(504);
      expect(data.code).toBe('TIMEOUT');
    }, 15000);
  });

  describe('Base64 Image Support', () => {
    it('should accept base64 encoded images', async () => {
      const base64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...';

      const request = new NextRequest('http://localhost/api/images/detect-faces', {
        method: 'POST',
        body: JSON.stringify({ image: base64Image }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });
});
