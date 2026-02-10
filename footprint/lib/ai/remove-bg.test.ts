/**
 * Remove.bg API Client Tests
 *
 * Tests for background removal API integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isRemoveBgConfigured, removeBackground } from './remove-bg';

describe('lib/ai/remove-bg', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('isRemoveBgConfigured', () => {
    it('should return true when REMOVEBG_API_KEY is set', () => {
      vi.stubEnv('REMOVEBG_API_KEY', 'test-api-key-123');
      expect(isRemoveBgConfigured()).toBe(true);
    });

    it('should return false when REMOVEBG_API_KEY is not set', () => {
      vi.stubEnv('REMOVEBG_API_KEY', '');
      expect(isRemoveBgConfigured()).toBe(false);
    });

    it('should return false when REMOVEBG_API_KEY is undefined', () => {
      delete process.env.REMOVEBG_API_KEY;
      expect(isRemoveBgConfigured()).toBe(false);
    });
  });

  describe('removeBackground', () => {
    const testImageUrl = 'https://example.com/photo.jpg';
    const mockBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk';

    beforeEach(() => {
      vi.stubEnv('REMOVEBG_API_KEY', 'test-api-key-123');
    });

    it('should throw error when API key is not configured', async () => {
      vi.stubEnv('REMOVEBG_API_KEY', '');

      await expect(removeBackground(testImageUrl)).rejects.toThrow(
        'REMOVEBG_API_KEY not configured'
      );
    });

    it('should call Remove.bg API with correct parameters', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });
      vi.stubGlobal('fetch', mockFetch);

      await removeBackground(testImageUrl);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.remove.bg/v1.0/removebg',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Api-Key': 'test-api-key-123',
          }),
        })
      );

      // Verify FormData body was passed
      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeInstanceOf(FormData);
    });

    it('should send correct FormData fields', async () => {
      const appendSpy = vi.spyOn(FormData.prototype, 'append');
      const mockArrayBuffer = new ArrayBuffer(8);
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });
      vi.stubGlobal('fetch', mockFetch);

      await removeBackground(testImageUrl);

      expect(appendSpy).toHaveBeenCalledWith('image_url', testImageUrl);
      expect(appendSpy).toHaveBeenCalledWith('size', 'auto');
      expect(appendSpy).toHaveBeenCalledWith('format', 'png');
    });

    it('should return base64-encoded string on success', async () => {
      const testData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG header bytes
      const mockArrayBuffer = testData.buffer;
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockArrayBuffer),
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await removeBackground(testImageUrl);

      // Verify it returns a base64 string
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Verify the base64 decodes back to the original data
      const decoded = Buffer.from(result, 'base64');
      expect(new Uint8Array(decoded)).toEqual(testData);
    });

    it('should throw error with API error title when response is not ok', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 402,
        statusText: 'Payment Required',
        json: () =>
          Promise.resolve({
            errors: [{ title: 'Insufficient credits' }],
          }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(removeBackground(testImageUrl)).rejects.toThrow(
        'Insufficient credits'
      );
    });

    it('should throw error with generic error field when errors array is missing', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            error: 'Invalid image URL',
          }),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(removeBackground(testImageUrl)).rejects.toThrow(
        'Invalid image URL'
      );
    });

    it('should throw error with status code when no error details available', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({}),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(removeBackground(testImageUrl)).rejects.toThrow(
        'Remove.bg API error: 500 Internal Server Error'
      );
    });

    it('should handle json parse failure in error response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: () => Promise.reject(new Error('Invalid JSON')),
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(removeBackground(testImageUrl)).rejects.toThrow(
        'Remove.bg API error: 503 Service Unavailable'
      );
    });

    it('should re-throw Error instances from fetch', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      await expect(removeBackground(testImageUrl)).rejects.toThrow('Network error');
    });

    it('should wrap non-Error exceptions', async () => {
      const mockFetch = vi.fn().mockRejectedValue('string error');
      vi.stubGlobal('fetch', mockFetch);

      await expect(removeBackground(testImageUrl)).rejects.toThrow(
        'Failed to remove background: Unknown error'
      );
    });
  });
});
