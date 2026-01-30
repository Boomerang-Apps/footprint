/**
 * Rate Limiting Utility
 * Uses Upstash Redis for distributed rate limiting across serverless functions
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Initialize Redis client (uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Check if Upstash is configured
const isUpstashConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

/**
 * Rate limit configurations for different endpoint types
 */
export const rateLimits = {
  // General API: 60 requests per minute
  general: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: 'ratelimit:general',
  }),

  // Upload: 20 uploads per minute (costly operation)
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    analytics: true,
    prefix: 'ratelimit:upload',
  }),

  // AI Transform: 10 per minute (expensive, uses AI credits)
  transform: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'ratelimit:transform',
  }),

  // Checkout: 5 per minute (payment flow)
  checkout: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'ratelimit:checkout',
  }),

  // Strict: 3 per minute (for sensitive operations)
  strict: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 m'),
    analytics: true,
    prefix: 'ratelimit:strict',
  }),
};

export type RateLimitType = keyof typeof rateLimits;

/**
 * Get client identifier from request headers
 * Uses X-Forwarded-For, X-Real-IP, or falls back to a default
 */
export async function getClientIdentifier(request?: Request): Promise<string> {
  try {
    if (request) {
      // Try to get IP from request headers
      const forwardedFor = request.headers.get('x-forwarded-for');
      if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
      }

      const realIp = request.headers.get('x-real-ip');
      if (realIp) {
        return realIp;
      }
    }

    // Try Next.js headers()
    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    const realIp = headerList.get('x-real-ip');
    if (realIp) {
      return realIp;
    }
  } catch {
    // headers() might fail in some contexts
  }

  return 'anonymous';
}

/**
 * Rate limit response with standard headers
 */
export function rateLimitResponse(reset: number): NextResponse {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: 'Too many requests. Please try again later.',
      code: 'RATE_LIMITED',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': 'See documentation',
        'X-RateLimit-Reset': String(reset),
      },
    }
  );
}

/**
 * Check rate limit for a request
 * Returns null if allowed, or a NextResponse if rate limited
 */
export async function checkRateLimit(
  type: RateLimitType = 'general',
  request?: Request,
  identifier?: string
): Promise<NextResponse | null> {
  // Skip rate limiting if Upstash is not configured (development)
  if (!isUpstashConfigured) {
    console.warn('Rate limiting skipped: Upstash not configured');
    return null;
  }

  try {
    const id = identifier || (await getClientIdentifier(request));
    const limiter = rateLimits[type];
    const { success, reset } = await limiter.limit(id);

    if (!success) {
      console.log(`Rate limit exceeded for ${type}: ${id}`);
      return rateLimitResponse(reset);
    }

    return null;
  } catch (error) {
    // If rate limiting fails, log and allow the request
    console.error('Rate limiting error:', error);
    return null;
  }
}

/**
 * Higher-order function to wrap an API handler with rate limiting
 *
 * Usage:
 * export const POST = withRateLimit('upload', async (request) => {
 *   // Your handler code
 * });
 */
export function withRateLimit<T>(
  type: RateLimitType,
  handler: (request: Request) => Promise<NextResponse<T>>
): (request: Request) => Promise<NextResponse<T> | NextResponse> {
  return async (request: Request) => {
    const rateLimited = await checkRateLimit(type, request);
    if (rateLimited) {
      return rateLimited;
    }
    return handler(request);
  };
}
