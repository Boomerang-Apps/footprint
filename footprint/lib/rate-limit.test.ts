/**
 * Rate Limiting Tests
 *
 * Tests for rateLimitResponse, getClientIdentifier, checkRateLimit,
 * and withRateLimit.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted so the mock fn is available when vi.mock factories run
const { mockLimit } = vi.hoisted(() => ({
  mockLimit: vi.fn(),
}));

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class MockRatelimit {
    limit = mockLimit;
    static slidingWindow() {
      return {};
    }
    constructor() {}
  },
}));

vi.mock('@upstash/redis', () => ({
  Redis: class MockRedis {
    constructor() {}
  },
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(null),
  }),
}));

import {
  rateLimitResponse,
  getClientIdentifier,
  checkRateLimit,
  withRateLimit,
  rateLimits,
} from './rate-limit';
import { NextResponse } from 'next/server';

describe('rateLimits', () => {
  it('should define all rate limit tiers', () => {
    expect(rateLimits.general).toBeDefined();
    expect(rateLimits.upload).toBeDefined();
    expect(rateLimits.transform).toBeDefined();
    expect(rateLimits.checkout).toBeDefined();
    expect(rateLimits.strict).toBeDefined();
  });
});

describe('rateLimitResponse', () => {
  it('should return 429 status', () => {
    const reset = Date.now() + 60000;
    const response = rateLimitResponse(reset);
    expect(response.status).toBe(429);
  });

  it('should include Retry-After header', () => {
    const reset = Date.now() + 30000;
    const response = rateLimitResponse(reset);
    const retryAfter = response.headers.get('Retry-After');
    expect(retryAfter).toBeTruthy();
    expect(parseInt(retryAfter!)).toBeGreaterThan(0);
  });

  it('should include rate limit error message in body', async () => {
    const reset = Date.now() + 5000;
    const response = rateLimitResponse(reset);
    const body = await response.json();
    expect(body.error).toContain('Too many requests');
    expect(body.code).toBe('RATE_LIMITED');
    expect(body.retryAfter).toBeGreaterThan(0);
  });

  it('should set X-RateLimit-Reset header', () => {
    const reset = Date.now() + 10000;
    const response = rateLimitResponse(reset);
    expect(response.headers.get('X-RateLimit-Reset')).toBe(String(reset));
  });
});

describe('getClientIdentifier', () => {
  it('should extract IP from x-forwarded-for header', async () => {
    const request = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    const id = await getClientIdentifier(request);
    expect(id).toBe('1.2.3.4');
  });

  it('should extract IP from x-real-ip header', async () => {
    const request = new Request('https://example.com', {
      headers: { 'x-real-ip': '10.0.0.1' },
    });
    const id = await getClientIdentifier(request);
    expect(id).toBe('10.0.0.1');
  });

  it('should prefer x-forwarded-for over x-real-ip', async () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '1.2.3.4',
        'x-real-ip': '10.0.0.1',
      },
    });
    const id = await getClientIdentifier(request);
    expect(id).toBe('1.2.3.4');
  });

  it('should return "anonymous" when no IP headers', async () => {
    const request = new Request('https://example.com');
    const id = await getClientIdentifier(request);
    expect(id).toBe('anonymous');
  });

  it('should trim whitespace from forwarded-for', async () => {
    const request = new Request('https://example.com', {
      headers: { 'x-forwarded-for': '  1.2.3.4  , 5.6.7.8' },
    });
    const id = await getClientIdentifier(request);
    expect(id).toBe('1.2.3.4');
  });
});

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when Upstash is not configured', async () => {
    // Default in test env: no Upstash env vars
    const result = await checkRateLimit('general');
    expect(result).toBeNull();
  });
});

describe('withRateLimit', () => {
  it('should call handler when not rate limited', async () => {
    const handler = vi.fn().mockResolvedValue(
      NextResponse.json({ ok: true })
    );

    const wrapped = withRateLimit('general', handler);
    const request = new Request('https://example.com');
    const response = await wrapped(request);

    expect(handler).toHaveBeenCalledWith(request);
    const body = await response.json();
    expect(body.ok).toBe(true);
  });
});
