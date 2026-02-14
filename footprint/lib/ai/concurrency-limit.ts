/**
 * Concurrency Limit — Per-User Transformation Limiting
 *
 * Uses Redis atomic INCR/DECR to enforce max 3 concurrent
 * transformations per user.
 *
 * AC-006: Concurrent limit 3/user
 */

import { logger } from '@/lib/logger';

const MAX_CONCURRENT = 3;
const KEY_PREFIX = 'concurrent';
const SAFETY_TTL_SECONDS = 120; // 2-minute safety net for stuck counters

export interface ConcurrencyResult {
  allowed: boolean;
  currentCount: number;
}

/** Minimal interface for the Redis methods we use */
export interface RedisLike {
  incr(key: string): Promise<number>;
  decr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
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

/** Lazily create a Redis client */
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
 * Build concurrency key for a user
 */
export function buildConcurrencyKey(userId: string): string {
  return `${KEY_PREFIX}:${userId}`;
}

/**
 * Attempt to acquire a concurrency slot for a user.
 * Returns { allowed: true } if under the limit, { allowed: false } if at capacity.
 * Gracefully degrades: allows all when Redis is unavailable.
 */
export async function acquireConcurrencySlot(
  userId: string
): Promise<ConcurrencyResult> {
  if (!isUpstashConfigured()) {
    return { allowed: true, currentCount: 0 };
  }

  try {
    const redis = getRedisClient();
    const key = buildConcurrencyKey(userId);

    // Atomic increment
    const count = await redis.incr(key);

    if (count > MAX_CONCURRENT) {
      // Over limit — decrement back and reject
      await redis.decr(key);
      return { allowed: false, currentCount: MAX_CONCURRENT };
    }

    // Set safety TTL so keys don't stick forever on crashes
    await redis.expire(key, SAFETY_TTL_SECONDS);
    return { allowed: true, currentCount: count };
  } catch (error) {
    logger.warn('Concurrency check failed, allowing request', error);
    return { allowed: true, currentCount: 0 };
  }
}

/**
 * Release a concurrency slot for a user.
 * Should be called in a finally block after transformation completes.
 * Does not throw on error.
 */
export async function releaseConcurrencySlot(userId: string): Promise<void> {
  if (!isUpstashConfigured()) {
    return;
  }

  try {
    const redis = getRedisClient();
    const key = buildConcurrencyKey(userId);

    const count = await redis.decr(key);

    // Clean up key if count is 0 or negative
    if (count <= 0) {
      await redis.del(key);
    }
  } catch (error) {
    logger.warn('Concurrency release failed', error);
  }
}
