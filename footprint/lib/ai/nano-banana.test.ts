/**
 * Nano Banana (Gemini) Integration Tests
 *
 * Tests for dataUriToBase64, base64ToDataUri, transformWithNanoBanana,
 * transformWithNanoBananaRetry, and loadReferenceImages.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  dataUriToBase64,
  base64ToDataUri,
  transformWithNanoBanana,
  transformWithNanoBananaRetry,
  loadReferenceImages,
} from './nano-banana';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('dataUriToBase64', () => {
  it('should extract base64 and mimeType from data URI', () => {
    const result = dataUriToBase64('data:image/png;base64,abc123');
    expect(result.base64).toBe('abc123');
    expect(result.mimeType).toBe('image/png');
  });

  it('should handle jpeg data URI', () => {
    const result = dataUriToBase64('data:image/jpeg;base64,xyz789');
    expect(result.base64).toBe('xyz789');
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('should treat non-data-URI string as raw base64', () => {
    const result = dataUriToBase64('rawbase64data');
    expect(result.base64).toBe('rawbase64data');
    expect(result.mimeType).toBe('image/jpeg');
  });

  it('should handle webp mime type', () => {
    const result = dataUriToBase64('data:image/webp;base64,webpdata');
    expect(result.base64).toBe('webpdata');
    expect(result.mimeType).toBe('image/webp');
  });
});

describe('base64ToDataUri', () => {
  it('should create data URI from base64 and mimeType', () => {
    const result = base64ToDataUri('abc123', 'image/png');
    expect(result).toBe('data:image/png;base64,abc123');
  });

  it('should handle jpeg', () => {
    const result = base64ToDataUri('data', 'image/jpeg');
    expect(result).toBe('data:image/jpeg;base64,data');
  });
});

describe('transformWithNanoBanana', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GOOGLE_AI_API_KEY', 'test-api-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should throw for missing API key', async () => {
    vi.stubEnv('GOOGLE_AI_API_KEY', '');
    await expect(
      transformWithNanoBanana('base64data', 'watercolor')
    ).rejects.toThrow('GOOGLE_AI_API_KEY is not configured');
  });

  it('should throw for invalid style', async () => {
    await expect(
      transformWithNanoBanana('base64data', 'invalid_style' as any)
    ).rejects.toThrow('Invalid style');
  });

  it('should call Gemini API with correct URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { mimeType: 'image/png', data: 'output123' } }],
            },
          },
        ],
        usageMetadata: { totalTokenCount: 1000 },
      }),
    });

    await transformWithNanoBanana('base64data', 'watercolor');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('generativelanguage.googleapis.com'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-goog-api-key': 'test-api-key',
        }),
      })
    );
  });

  it('should return transformed image data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { mimeType: 'image/png', data: 'transformed123' } }],
            },
          },
        ],
        usageMetadata: { totalTokenCount: 1290 },
      }),
    });

    const result = await transformWithNanoBanana('base64data', 'pop_art');

    expect(result.imageBase64).toBe('transformed123');
    expect(result.mimeType).toBe('image/png');
    expect(result.tokensUsed).toBe(1290);
    expect(result.estimatedCost).toBeCloseTo(0.0387, 3);
  });

  it('should throw on HTTP error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => '{"error":{"message":"Internal error"}}',
    });

    await expect(
      transformWithNanoBanana('base64data', 'watercolor')
    ).rejects.toThrow('Nano Banana API error');
  });

  it('should throw on API-level error in response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        error: { code: 400, message: 'Bad request', status: 'INVALID_ARGUMENT' },
      }),
    });

    await expect(
      transformWithNanoBanana('base64data', 'line_art')
    ).rejects.toThrow('Bad request');
  });

  it('should throw when no candidates returned', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [] }),
    });

    await expect(
      transformWithNanoBanana('base64data', 'oil_painting')
    ).rejects.toThrow('No output returned');
  });

  it('should throw when no image part in response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: 'some text response' }],
            },
          },
        ],
      }),
    });

    await expect(
      transformWithNanoBanana('base64data', 'vintage')
    ).rejects.toThrow('No image in Nano Banana response');
  });

  it('should include reference images in request', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { mimeType: 'image/png', data: 'result' } }],
            },
          },
        ],
        usageMetadata: { totalTokenCount: 2000 },
      }),
    });

    const refs = [
      { base64: 'ref1data', mimeType: 'image/jpeg' },
      { base64: 'ref2data', mimeType: 'image/png' },
    ];

    await transformWithNanoBanana('base64data', 'watercolor', 'image/jpeg', refs);

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    // Should have ref1, ref2, source image, and prompt = 4 parts
    expect(callBody.contents[0].parts).toHaveLength(4);
  });

  it('should handle non-JSON error response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    });

    await expect(
      transformWithNanoBanana('base64data', 'romantic')
    ).rejects.toThrow('Service Unavailable');
  });

  it('should default to 1290 tokens when usageMetadata is missing', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ inlineData: { mimeType: 'image/png', data: 'out' } }],
            },
          },
        ],
      }),
    });

    const result = await transformWithNanoBanana('base64data', 'watercolor');
    expect(result.tokensUsed).toBe(1290);
  });
});

describe('transformWithNanoBananaRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GOOGLE_AI_API_KEY', 'test-api-key');
    // Speed up retries in tests
    vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      (fn as () => void)();
      return 0 as unknown as NodeJS.Timeout;
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('should succeed on first attempt', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          { content: { parts: [{ inlineData: { mimeType: 'image/png', data: 'ok' } }] } },
        ],
      }),
    });

    const result = await transformWithNanoBananaRetry('data', 'watercolor', 'image/jpeg', 3);
    expect(result.imageBase64).toBe('ok');
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should retry on transient failure', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'Overloaded' })
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            { content: { parts: [{ inlineData: { mimeType: 'image/png', data: 'ok' } }] } },
          ],
        }),
      });

    const result = await transformWithNanoBananaRetry('data', 'watercolor');
    expect(result.imageBase64).toBe('ok');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should not retry on invalid style', async () => {
    await expect(
      transformWithNanoBananaRetry('data', 'fake' as any)
    ).rejects.toThrow('Invalid style');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should not retry on missing API key', async () => {
    vi.stubEnv('GOOGLE_AI_API_KEY', '');
    await expect(
      transformWithNanoBananaRetry('data', 'watercolor')
    ).rejects.toThrow('not configured');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should throw after all retries exhausted', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Server Error',
    });

    await expect(
      transformWithNanoBananaRetry('data', 'pop_art', 'image/jpeg', 2)
    ).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe('loadReferenceImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load images from URLs', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'image/png' },
      arrayBuffer: async () => new ArrayBuffer(8),
    });

    const refs = await loadReferenceImages(
      ['/style-references/watercolor/ref1.jpg'],
      'https://example.com'
    );

    expect(refs).toHaveLength(1);
    expect(refs[0].mimeType).toBe('image/png');
    expect(refs[0].base64).toBeTruthy();
  });

  it('should build full URL from relative path', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'image/jpeg' },
      arrayBuffer: async () => new ArrayBuffer(4),
    });

    await loadReferenceImages(['/ref.jpg'], 'https://myapp.com');

    expect(mockFetch).toHaveBeenCalledWith('https://myapp.com/ref.jpg', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('should use absolute URL as-is', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => 'image/jpeg' },
      arrayBuffer: async () => new ArrayBuffer(4),
    });

    await loadReferenceImages(['https://cdn.example.com/img.jpg'], 'https://myapp.com');

    expect(mockFetch).toHaveBeenCalledWith('https://cdn.example.com/img.jpg', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('should skip failed downloads', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });

    const refs = await loadReferenceImages(['/missing.jpg'], 'https://example.com');

    expect(refs).toHaveLength(0);
  });

  it('should handle fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const refs = await loadReferenceImages(['/ref.jpg'], 'https://example.com');

    expect(refs).toHaveLength(0);
  });

  it('should return empty array for empty input', async () => {
    const refs = await loadReferenceImages([], 'https://example.com');
    expect(refs).toEqual([]);
  });

  it('should default mimeType to image/jpeg', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      headers: { get: () => null },
      arrayBuffer: async () => new ArrayBuffer(4),
    });

    const refs = await loadReferenceImages(['/ref.jpg'], 'https://example.com');
    expect(refs[0].mimeType).toBe('image/jpeg');
  });
});
