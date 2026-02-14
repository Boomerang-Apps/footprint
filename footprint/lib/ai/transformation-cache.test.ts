import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getCachedTransformation,
  setCachedTransformation,
  invalidateCachedTransformation,
  buildCacheKey,
  _setRedisClient,
  type CachedTransformation,
  type RedisLike,
} from './transformation-cache';

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const SAMPLE_DATA: CachedTransformation = {
  url: 'https://images.footprint.co.il/transformed/user123/watercolor.png',
  provider: 'nano-banana',
  transformationId: 'tx-123',
};

function createMockRedis() {
  return {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  } satisfies RedisLike;
}

describe('transformation-cache', () => {
  let mockRedis: ReturnType<typeof createMockRedis>;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    mockRedis = createMockRedis();
    _setRedisClient(mockRedis);
  });

  afterEach(() => {
    _setRedisClient(null);
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  describe('buildCacheKey', () => {
    it('should format key as transform:{key}:{style}', () => {
      expect(buildCacheKey('uploads/user123/photo.jpg', 'watercolor')).toBe(
        'transform:uploads/user123/photo.jpg:watercolor'
      );
    });
  });

  describe('getCachedTransformation', () => {
    it('should return cached data on Redis hit', async () => {
      mockRedis.get.mockResolvedValue(SAMPLE_DATA);

      const result = await getCachedTransformation('uploads/photo.jpg', 'watercolor');

      expect(result).toEqual(SAMPLE_DATA);
      expect(mockRedis.get).toHaveBeenCalledWith('transform:uploads/photo.jpg:watercolor');
    });

    it('should return null on cache miss', async () => {
      mockRedis.get.mockResolvedValue(null);

      const result = await getCachedTransformation('uploads/photo.jpg', 'watercolor');

      expect(result).toBeNull();
    });

    it('should return null when Upstash is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const result = await getCachedTransformation('uploads/photo.jpg', 'watercolor');

      expect(result).toBeNull();
      expect(mockRedis.get).not.toHaveBeenCalled();
    });

    it('should return null on Redis error (never throws)', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await getCachedTransformation('uploads/photo.jpg', 'watercolor');

      expect(result).toBeNull();
    });
  });

  describe('setCachedTransformation', () => {
    it('should SET with correct key, value, and 7-day TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');

      await setCachedTransformation('uploads/photo.jpg', 'watercolor', SAMPLE_DATA);

      expect(mockRedis.set).toHaveBeenCalledWith(
        'transform:uploads/photo.jpg:watercolor',
        SAMPLE_DATA,
        { ex: 604800 }
      );
    });

    it('should not throw on Redis error', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis write failed'));

      await expect(
        setCachedTransformation('uploads/photo.jpg', 'watercolor', SAMPLE_DATA)
      ).resolves.toBeUndefined();
    });

    it('should skip when Upstash is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      await setCachedTransformation('uploads/photo.jpg', 'watercolor', SAMPLE_DATA);

      expect(mockRedis.set).not.toHaveBeenCalled();
    });
  });

  describe('invalidateCachedTransformation', () => {
    it('should DEL the correct key', async () => {
      mockRedis.del.mockResolvedValue(1);

      await invalidateCachedTransformation('uploads/photo.jpg', 'watercolor');

      expect(mockRedis.del).toHaveBeenCalledWith('transform:uploads/photo.jpg:watercolor');
    });

    it('should not throw on Redis error', async () => {
      mockRedis.del.mockRejectedValue(new Error('Redis delete failed'));

      await expect(
        invalidateCachedTransformation('uploads/photo.jpg', 'watercolor')
      ).resolves.toBeUndefined();
    });
  });
});
