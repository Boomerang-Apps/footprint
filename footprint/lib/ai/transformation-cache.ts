/**
 * Transformation Cache — Upstash Redis Layer
 *
 * Fast cache in front of existing Supabase DB cache for AI transformations.
 * Flow: Redis GET (~50ms) → miss → DB query (~300ms) → miss → AI provider
 *
 * AC-003: Cache hit latency <200ms
 * AC-004: Cache invalidation 7-day TTL
 */

import { logger } from '@/lib/logger';

const CACHE_TTL_SECONDS = 604800; // 7 days
const CACHE_PREFIX = 'transform';

export interface CachedTransformation {
  url: string;
  provider: string;
  transformationId: string;
}

/** Minimal interface for the Redis methods we use */
export interface RedisLike {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, opts?: { ex?: number }): Promise<unknown>;
  del(key: string): Promise<unknown>;
}

/**
 * Check if Upstash Redis is configured
 */
export function isUpstashConfigured(): boolean {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

/** Lazily create a Redis client. Exported for testing. */
let _redisClient: RedisLike | null = null;

export function getRedisClient(): RedisLike {
  if (!_redisClient) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Redis } = require('@upstash/redis');
    _redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    }) as RedisLike;
  }
  return _redisClient;
}

/** Override the Redis client (for testing) */
export function _setRedisClient(client: RedisLike | null): void {
  _redisClient = client;
}

/**
 * Build cache key from image key and style
 */
export function buildCacheKey(originalImageKey: string, style: string): string {
  return `${CACHE_PREFIX}:${originalImageKey}:${style}`;
}

/**
 * Get a cached transformation result from Redis
 * Returns null on miss or error (never throws)
 */
export async function getCachedTransformation(
  originalImageKey: string,
  style: string
): Promise<CachedTransformation | null> {
  if (!isUpstashConfigured()) {
    return null;
  }

  try {
    const redis = getRedisClient();
    const key = buildCacheKey(originalImageKey, style);
    const cached = await redis.get<CachedTransformation>(key);
    return cached ?? null;
  } catch (error) {
    logger.warn('Redis cache GET failed, falling through to DB', error);
    return null;
  }
}

/**
 * Store a transformation result in Redis cache with 7-day TTL
 * Does not throw on error
 */
export async function setCachedTransformation(
  originalImageKey: string,
  style: string,
  data: CachedTransformation
): Promise<void> {
  if (!isUpstashConfigured()) {
    return;
  }

  try {
    const redis = getRedisClient();
    const key = buildCacheKey(originalImageKey, style);
    await redis.set(key, data, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    logger.warn('Redis cache SET failed', error);
  }
}

/**
 * Invalidate a cached transformation
 * Does not throw on error
 */
export async function invalidateCachedTransformation(
  originalImageKey: string,
  style: string
): Promise<void> {
  if (!isUpstashConfigured()) {
    return;
  }

  try {
    const redis = getRedisClient();
    const key = buildCacheKey(originalImageKey, style);
    await redis.del(key);
  } catch (error) {
    logger.warn('Redis cache DEL failed', error);
  }
}
