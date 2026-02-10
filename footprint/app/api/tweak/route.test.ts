/**
 * Tests for POST /api/tweak - AI Image Editing
 *
 * Story: TWEAK-API-001 - AI Image Editing with Background Removal
 * DAL Level: C (Core user-facing API)
 * Coverage Target: 90% statements, 85% branches
 *
 * TDD Cycle: Retrospective (code exists, writing tests after)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { POST } from './route';

// Set up environment variables for tests
process.env.GOOGLE_AI_API_KEY = 'test-google-api-key';
process.env.REMOVEBG_API_KEY = 'test-removebg-api-key';

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'test-user-id' } }, error: null })),
    },
  })),
}));

vi.mock('@/lib/storage/supabase-storage', () => ({
  uploadToSupabase: vi.fn(() =>
    Promise.resolve({
      publicUrl: 'https://images.footprint.co.il/tweaked/test.png',
      path: 'tweaked/test.png',
    })
  ),
}));

vi.mock('@/lib/ai/remove-bg', () => ({
  removeBackground: vi.fn(),
  isRemoveBgConfigured: vi.fn(() => true),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)), // null = rate limit passed
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock global fetch for image fetching and Gemini API
global.fetch = vi.fn((url) => {
  const urlString = typeof url === 'string' ? url : url.toString();

  // Mock image fetching from Supabase
  if (urlString.includes('images.footprint.co.il')) {
    const mockImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    return Promise.resolve({
      ok: true,
      headers: {
        get: (name: string) => name === 'content-type' ? 'image/jpeg' : null,
      },
      arrayBuffer: () => Promise.resolve(mockImageBuffer.buffer),
    } as Response);
  }

  // Mock Gemini API calls
  if (urlString.includes('generativelanguage.googleapis.com')) {
    const mockGeminiResponse = {
      candidates: [{
        content: {
          parts: [{
            inlineData: {
              data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
              mimeType: 'image/png',
            },
          }],
        },
      }],
    };
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockGeminiResponse),
    } as Response);
  }

  return Promise.reject(new Error('Not found'));
}) as any;

// Import mocked functions for assertions
import { removeBackground, isRemoveBgConfigured } from '@/lib/ai/remove-bg';
import { checkRateLimit } from '@/lib/rate-limit';

describe('TWEAK-API-001: AI Image Editing with Background Removal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    process.env.GOOGLE_AI_API_KEY = 'test-google-api-key';
    process.env.REMOVEBG_API_KEY = 'test-removebg-api-key';
    // Reset default mocks
    vi.mocked(checkRateLimit).mockResolvedValue(null);
    vi.mocked(isRemoveBgConfigured).mockReturnValue(true);
  });

  describe('AC1: Background Removal Success', () => {
    it('should use Remove.bg and return PNG with transparency when background removal requested', async () => {
      // Arrange
      const mockBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      vi.mocked(removeBackground).mockResolvedValue(mockBase64);

      const request = new Request('http://localhost:3000/api/tweak', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/transformed/test.jpg',
          prompt: 'Remove the background',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.imageUrl).toBe('https://images.footprint.co.il/tweaked/test.png');
      expect(removeBackground).toHaveBeenCalledWith('https://images.footprint.co.il/transformed/test.jpg');
    });
  });

  describe('AC2: Background Removal - Foreground Not Detected', () => {
    it('should return helpful Hebrew error when Remove.bg cannot identify foreground', async () => {
      // Arrange
      const foregroundError = new Error('Could not identify foreground in image. For details and recommendations see https://www.remove.bg/supported-images.');
      vi.mocked(removeBackground).mockRejectedValue(foregroundError);

      const request = new Request('http://localhost:3000/api/tweak', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/transformed/artistic.jpg',
          prompt: 'Remove the background',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert - EARS: THEN return helpful Hebrew error message
      expect(response.status).toBe(500);
      expect(data.error).toContain('לא ניתן לזהות את הנושא בתמונה');
      expect(data.error).toContain('נסו תמונה אחרת');
      expect(data.code).toBe('REMOVEBG_FAILED');
      expect(data.details).toContain('Could not identify foreground');
    });

    it('should return generic Hebrew error for other Remove.bg failures', async () => {
      // Arrange
      const genericError = new Error('API quota exceeded');
      vi.mocked(removeBackground).mockRejectedValue(genericError);

      const request = new Request('http://localhost:3000/api/tweak', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/transformed/test.jpg',
          prompt: 'Remove the background',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.error).toContain('שגיאה בהסרת הרקע');
      expect(data.error).toContain('נסו שוב מאוחר יותר');
      expect(data.code).toBe('REMOVEBG_FAILED');
    });
  });

  describe('AC3: Background Removal - API Key Missing', () => {
    it('should fall back to Gemini when Remove.bg API key not configured', async () => {
      // Arrange
      vi.mocked(isRemoveBgConfigured).mockReturnValue(false);

      const request = new Request('http://localhost:3000/api/tweak', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/transformed/test.jpg',
          prompt: 'Remove the background',
        }),
      });

      // Act
      const response = await POST(request);

      // Assert - EARS: THEN fallback to Gemini and successfully process
      // Note: In production, if Remove.bg not configured, route uses Gemini instead
      // With our mocked Gemini API, this should succeed
      expect(response.status).toBe(200);
      expect(removeBackground).not.toHaveBeenCalled();
    });
  });

  describe('AC4: AI Edit Operations (Non-Background Removal)', () => {
    it('should use Gemini for other AI edits like enhance', async () => {
      // Arrange
      // Note: Gemini uses internal callGeminiWithPrompt function, so we test via response only

      const request = new Request('http://localhost:3000/api/tweak', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/transformed/test.jpg',
          prompt: 'Enhance the image quality',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.imageUrl).toBeDefined();
      expect(removeBackground).not.toHaveBeenCalled(); // Should NOT use Remove.bg for non-BG tasks
    });
  });

  describe('AC5: Rate Limiting', () => {
    it('should return 429 when rate limit exceeded', async () => {
      // Arrange
      // checkRateLimit returns NextResponse when rate limited, null when allowed
      const rateLimitResponse = NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Reset': String(Date.now() + 60000),
          }
        }
      );
      vi.mocked(checkRateLimit).mockResolvedValue(rateLimitResponse);

      const request = new Request('http://localhost:3000/api/tweak', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/transformed/test.jpg',
          prompt: 'Remove the background',
        }),
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert - EARS: THEN return 429 error
      expect(response.status).toBe(429);
      expect(data.error).toContain('Too many requests');
    });
  });

  describe('Edge Cases', () => {
    it('should return 400 for missing imageUrl', async () => {
      const request = new Request('http://localhost:3000/api/tweak', {
        method: 'POST',
        body: JSON.stringify({
          prompt: 'Remove the background',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('imageUrl');
    });

    it('should return 400 for missing prompt', async () => {
      const request = new Request('http://localhost:3000/api/tweak', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/transformed/test.jpg',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('prompt');
    });

    it('should return 400 for invalid URL format', async () => {
      const request = new Request('http://localhost:3000/api/tweak', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'not-a-valid-url',
          prompt: 'Remove the background',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid imageUrl format');
    });
  });
});
