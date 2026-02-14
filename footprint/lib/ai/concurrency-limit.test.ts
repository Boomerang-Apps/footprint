import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  acquireConcurrencySlot,
  releaseConcurrencySlot,
  buildConcurrencyKey,
  _setRedisClient,
  type RedisLike,
} from './concurrency-limit';

vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

function createMockRedis() {
  return {
    incr: vi.fn(),
    decr: vi.fn(),
    expire: vi.fn(),
    del: vi.fn(),
  } satisfies RedisLike;
}

describe('concurrency-limit', () => {
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

  describe('buildConcurrencyKey', () => {
    it('should format key as concurrent:{userId}', () => {
      expect(buildConcurrencyKey('user123')).toBe('concurrent:user123');
    });
  });

  describe('acquireConcurrencySlot', () => {
    it('should allow when count < 3', async () => {
      mockRedis.incr.mockResolvedValue(1);
      mockRedis.expire.mockResolvedValue(1);

      const result = await acquireConcurrencySlot('user123');

      expect(result).toEqual({ allowed: true, currentCount: 1 });
      expect(mockRedis.incr).toHaveBeenCalledWith('concurrent:user123');
    });

    it('should allow up to exactly 3', async () => {
      mockRedis.incr.mockResolvedValue(3);
      mockRedis.expire.mockResolvedValue(1);

      const result = await acquireConcurrencySlot('user123');

      expect(result).toEqual({ allowed: true, currentCount: 3 });
    });

    it('should reject at 4 and decrement back', async () => {
      mockRedis.incr.mockResolvedValue(4);
      mockRedis.decr.mockResolvedValue(3);

      const result = await acquireConcurrencySlot('user123');

      expect(result).toEqual({ allowed: false, currentCount: 3 });
      expect(mockRedis.decr).toHaveBeenCalledWith('concurrent:user123');
      expect(mockRedis.expire).not.toHaveBeenCalled();
    });

    it('should set TTL on counter key for safety', async () => {
      mockRedis.incr.mockResolvedValue(2);
      mockRedis.expire.mockResolvedValue(1);

      await acquireConcurrencySlot('user123');

      expect(mockRedis.expire).toHaveBeenCalledWith('concurrent:user123', 120);
    });

    it('should allow when Upstash is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      const result = await acquireConcurrencySlot('user123');

      expect(result).toEqual({ allowed: true, currentCount: 0 });
      expect(mockRedis.incr).not.toHaveBeenCalled();
    });

    it('should allow on Redis error and log warning', async () => {
      mockRedis.incr.mockRejectedValue(new Error('Redis timeout'));

      const result = await acquireConcurrencySlot('user123');

      expect(result).toEqual({ allowed: true, currentCount: 0 });
    });
  });

  describe('releaseConcurrencySlot', () => {
    it('should decrement on release', async () => {
      mockRedis.decr.mockResolvedValue(1);

      await releaseConcurrencySlot('user123');

      expect(mockRedis.decr).toHaveBeenCalledWith('concurrent:user123');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('should delete key when count reaches 0', async () => {
      mockRedis.decr.mockResolvedValue(0);

      await releaseConcurrencySlot('user123');

      expect(mockRedis.decr).toHaveBeenCalledWith('concurrent:user123');
      expect(mockRedis.del).toHaveBeenCalledWith('concurrent:user123');
    });

    it('should delete key when count goes negative', async () => {
      mockRedis.decr.mockResolvedValue(-1);

      await releaseConcurrencySlot('user123');

      expect(mockRedis.del).toHaveBeenCalledWith('concurrent:user123');
    });

    it('should not throw on Redis error', async () => {
      mockRedis.decr.mockRejectedValue(new Error('Redis error'));

      await expect(releaseConcurrencySlot('user123')).resolves.toBeUndefined();
    });

    it('should skip when Upstash is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;

      await releaseConcurrencySlot('user123');

      expect(mockRedis.decr).not.toHaveBeenCalled();
    });
  });
});
