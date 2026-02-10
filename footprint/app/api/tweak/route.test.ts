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
import { POST } from './route';

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

vi.mock('@/lib/ai/nano-banana', () => ({
  transformWithNanoBananaRetry: vi.fn(),
  dataUriToBase64: vi.fn((dataUri) => dataUri.split(',')[1]),
  base64ToDataUri: vi.fn((base64, mimeType) => `data:${mimeType};base64,${base64}`),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({ success: true, remaining: 10 })),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Import mocked functions for assertions
import { removeBackground, isRemoveBgConfigured } from '@/lib/ai/remove-bg';
import { transformWithNanoBananaRetry } from '@/lib/ai/nano-banana';
import { checkRateLimit } from '@/lib/rate-limit';

describe('TWEAK-API-001: AI Image Editing with Background Removal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      expect(transformWithNanoBananaRetry).not.toHaveBeenCalled(); // Should use Remove.bg, not Gemini
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
    it('should return 503 when Remove.bg API key not configured', async () => {
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
      const data = await response.json();

      // Assert - EARS: THEN return 503 error
      expect(response.status).toBe(503);
      expect(data.error).toContain('Background removal service not configured');
      expect(removeBackground).not.toHaveBeenCalled();
    });
  });

  describe('AC4: AI Edit Operations (Non-Background Removal)', () => {
    it('should use Gemini for other AI edits like enhance', async () => {
      // Arrange
      vi.mocked(transformWithNanoBananaRetry).mockResolvedValue('edited-image-base64');

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
      expect(transformWithNanoBananaRetry).toHaveBeenCalled();
      expect(removeBackground).not.toHaveBeenCalled(); // Should NOT use Remove.bg for non-BG tasks
    });
  });

  describe('AC5: Rate Limiting', () => {
    it('should return 429 when rate limit exceeded', async () => {
      // Arrange
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: false,
        remaining: 0,
        limit: 10,
        reset: Date.now() + 60000,
      });

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

    it('should return 401 for unauthenticated requests', async () => {
      // Mock auth failure
      const { createClient } = await import('@/lib/supabase/server');
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: new Error('Not authenticated') })),
        },
      } as any);

      const request = new Request('http://localhost:3000/api/tweak', {
        method: 'POST',
        body: JSON.stringify({
          imageUrl: 'https://images.footprint.co.il/transformed/test.jpg',
          prompt: 'Remove the background',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });
  });
});
