import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithTimeout, TIMEOUT_DEFAULTS } from './fetch-with-timeout';

describe('fetchWithTimeout', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.useRealTimers();
  });

  it('should return response on successful fetch', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const result = await fetchWithTimeout('https://api.example.com/test', {
      timeout: 5000,
    });

    expect(result).toBe(mockResponse);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('should pass through fetch options', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response('ok'));

    await fetchWithTimeout('https://api.example.com/test', {
      timeout: 5000,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'value' }),
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'value' }),
      })
    );
  });

  it('should throw timeout error when request exceeds timeout', async () => {
    vi.useFakeTimers();

    globalThis.fetch = vi.fn().mockImplementation(
      (_url: string, options: RequestInit) =>
        new Promise((_resolve, reject) => {
          options.signal?.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        })
    );

    const fetchPromise = fetchWithTimeout('https://api.example.com/slow', {
      timeout: 1000,
    });

    vi.advanceTimersByTime(1001);

    await expect(fetchPromise).rejects.toThrow(
      'Request timeout after 1000ms: https://api.example.com/slow'
    );
  });

  it('should re-throw non-abort errors', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      fetchWithTimeout('https://api.example.com/test', { timeout: 5000 })
    ).rejects.toThrow('Network error');
  });

  it('should not timeout when request completes in time', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response('fast', { status: 200 }));

    const result = await fetchWithTimeout('https://api.example.com/fast', {
      timeout: 5000,
    });

    expect(result.status).toBe(200);
  });
});

describe('TIMEOUT_DEFAULTS', () => {
  it('should have API timeout of 15s', () => {
    expect(TIMEOUT_DEFAULTS.API).toBe(15_000);
  });

  it('should have AI timeout of 30s', () => {
    expect(TIMEOUT_DEFAULTS.AI).toBe(30_000);
  });
});
