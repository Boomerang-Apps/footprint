/**
 * Transformation Tracking Database Service - Tests
 *
 * Tests for all transformation CRUD operations against the Supabase database.
 * The Supabase client is fully mocked via vi.mock.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client before imports
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import {
  createTransformation,
  startTransformation,
  completeTransformation,
  failTransformation,
  getTransformation,
  getUserTransformations,
  getUserCost,
  getTransformationStats,
  findExistingTransformation,
  type Transformation,
  type CreateTransformationInput,
  type CompleteTransformationInput,
  type FailTransformationInput,
} from './transformations';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a chainable mock that mimics the Supabase query builder.
 *
 * Every method (insert, update, select, eq, gte, lte, order, limit, single)
 * returns the same chainable object so calls can be chained in any order.
 * The terminal `single` call is a separate mock so tests can set its resolved
 * value independently. For non-single terminal calls the chainable itself is
 * awaited (Supabase client returns a thenable).
 */
function createMockSupabase() {
  const mockSingle = vi.fn();

  const chainable: Record<string, ReturnType<typeof vi.fn>> = {};

  chainable.insert = vi.fn().mockReturnValue(chainable);
  chainable.update = vi.fn().mockReturnValue(chainable);
  chainable.select = vi.fn().mockReturnValue(chainable);
  chainable.eq = vi.fn().mockReturnValue(chainable);
  chainable.gte = vi.fn().mockReturnValue(chainable);
  chainable.lte = vi.fn().mockReturnValue(chainable);
  chainable.order = vi.fn().mockReturnValue(chainable);
  chainable.limit = vi.fn().mockReturnValue(chainable);
  chainable.single = mockSingle;

  // For queries that do NOT end with .single() the caller awaits the
  // chainable directly.  We make the chainable a thenable by adding a
  // `then` property that vitest/promise can resolve. Tests set
  // `chainable.then` via the helper `setChainableResult`.
  //
  // By default resolves to { data: null, error: null }.
  let _chainableResolve: { data: unknown; error: unknown } = { data: null, error: null };

  // We use Object.defineProperty so `then` behaves like a PromiseLike.
  Object.defineProperty(chainable, 'then', {
    get() {
      return (
        onFulfilled?: (value: unknown) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) => {
        return Promise.resolve(_chainableResolve).then(onFulfilled, onRejected);
      };
    },
    configurable: true,
  });

  function setChainableResult(result: { data: unknown; error: unknown }) {
    _chainableResolve = result;
  }

  const mockFrom = vi.fn().mockReturnValue(chainable);

  const client = { from: mockFrom };

  return {
    client,
    mockFrom,
    mockSingle,
    chainable,
    setChainableResult,
  };
}

function setupMockClient(mock: ReturnType<typeof createMockSupabase>) {
  vi.mocked(createClient).mockResolvedValue(mock.client as never);
}

/** Factory for a sample Transformation record. */
function makeSampleTransformation(overrides: Partial<Transformation> = {}): Transformation {
  return {
    id: 'txn-001',
    user_id: 'user-123',
    original_image_key: 'originals/photo.jpg',
    transformed_image_key: 'transformed/photo-pop.jpg',
    style: 'pop_art',
    provider: 'nano-banana',
    status: 'completed',
    tokens_used: 100,
    estimated_cost: 0.039,
    processing_time_ms: 2500,
    error_message: null,
    created_at: '2026-01-15T10:00:00.000Z',
    completed_at: '2026-01-15T10:00:02.500Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Transformation Tracking Database Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // -----------------------------------------------------------------------
  // createTransformation
  // -----------------------------------------------------------------------
  describe('createTransformation', () => {
    const input: CreateTransformationInput = {
      userId: 'user-123',
      originalImageKey: 'originals/photo.jpg',
      style: 'pop_art',
      provider: 'nano-banana',
    };

    it('should insert a new transformation and return the record', async () => {
      const mock = createMockSupabase();
      const expected = makeSampleTransformation({ status: 'pending' });
      mock.mockSingle.mockResolvedValue({ data: expected, error: null });
      setupMockClient(mock);

      const result = await createTransformation(input);

      expect(result).toEqual(expected);
      expect(mock.mockFrom).toHaveBeenCalledWith('transformations');
      expect(mock.chainable.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        original_image_key: 'originals/photo.jpg',
        style: 'pop_art',
        provider: 'nano-banana',
        status: 'pending',
      });
      expect(mock.chainable.select).toHaveBeenCalled();
      expect(mock.mockSingle).toHaveBeenCalled();
    });

    it('should throw when supabase returns an error', async () => {
      const mock = createMockSupabase();
      mock.mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'duplicate key violation' },
      });
      setupMockClient(mock);

      await expect(createTransformation(input)).rejects.toThrow(
        'Failed to create transformation record: duplicate key violation'
      );
    });
  });

  // -----------------------------------------------------------------------
  // startTransformation
  // -----------------------------------------------------------------------
  describe('startTransformation', () => {
    it('should update the status to processing', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({ data: null, error: null });
      setupMockClient(mock);

      await startTransformation('txn-001');

      expect(mock.mockFrom).toHaveBeenCalledWith('transformations');
      expect(mock.chainable.update).toHaveBeenCalledWith({ status: 'processing' });
      expect(mock.chainable.eq).toHaveBeenCalledWith('id', 'txn-001');
    });

    it('should throw when supabase returns an error', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({
        data: null,
        error: { message: 'row not found' },
      });
      setupMockClient(mock);

      await expect(startTransformation('txn-missing')).rejects.toThrow(
        'Failed to start transformation: row not found'
      );
    });
  });

  // -----------------------------------------------------------------------
  // completeTransformation
  // -----------------------------------------------------------------------
  describe('completeTransformation', () => {
    const completeInput: CompleteTransformationInput = {
      transformedImageKey: 'transformed/photo-pop.jpg',
      tokensUsed: 100,
      estimatedCost: 0.039,
      processingTimeMs: 2500,
    };

    it('should update the record with completed data and return it', async () => {
      const mock = createMockSupabase();
      const expected = makeSampleTransformation();
      mock.mockSingle.mockResolvedValue({ data: expected, error: null });
      setupMockClient(mock);

      const result = await completeTransformation('txn-001', completeInput);

      expect(result).toEqual(expected);
      expect(mock.mockFrom).toHaveBeenCalledWith('transformations');
      expect(mock.chainable.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          transformed_image_key: 'transformed/photo-pop.jpg',
          tokens_used: 100,
          estimated_cost: 0.039,
          processing_time_ms: 2500,
          completed_at: expect.any(String),
        })
      );
      expect(mock.chainable.eq).toHaveBeenCalledWith('id', 'txn-001');
      expect(mock.chainable.select).toHaveBeenCalled();
      expect(mock.mockSingle).toHaveBeenCalled();
    });

    it('should pass null for optional tokensUsed and estimatedCost when omitted', async () => {
      const mock = createMockSupabase();
      mock.mockSingle.mockResolvedValue({
        data: makeSampleTransformation({ tokens_used: null, estimated_cost: null }),
        error: null,
      });
      setupMockClient(mock);

      await completeTransformation('txn-001', {
        transformedImageKey: 'transformed/photo-pop.jpg',
        processingTimeMs: 1200,
      });

      expect(mock.chainable.update).toHaveBeenCalledWith(
        expect.objectContaining({
          tokens_used: null,
          estimated_cost: null,
        })
      );
    });

    it('should throw when supabase returns an error', async () => {
      const mock = createMockSupabase();
      mock.mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'connection timeout' },
      });
      setupMockClient(mock);

      await expect(completeTransformation('txn-001', completeInput)).rejects.toThrow(
        'Failed to complete transformation: connection timeout'
      );
    });
  });

  // -----------------------------------------------------------------------
  // failTransformation
  // -----------------------------------------------------------------------
  describe('failTransformation', () => {
    const failInput: FailTransformationInput = {
      errorMessage: 'Model inference timed out',
      processingTimeMs: 30000,
    };

    it('should update the record with error info', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({ data: null, error: null });
      setupMockClient(mock);

      await failTransformation('txn-001', failInput);

      expect(mock.mockFrom).toHaveBeenCalledWith('transformations');
      expect(mock.chainable.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error_message: 'Model inference timed out',
          processing_time_ms: 30000,
          completed_at: expect.any(String),
        })
      );
      expect(mock.chainable.eq).toHaveBeenCalledWith('id', 'txn-001');
    });

    it('should throw when supabase returns an error', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({
        data: null,
        error: { message: 'permission denied' },
      });
      setupMockClient(mock);

      await expect(failTransformation('txn-001', failInput)).rejects.toThrow(
        'Failed to update transformation status: permission denied'
      );
    });
  });

  // -----------------------------------------------------------------------
  // getTransformation
  // -----------------------------------------------------------------------
  describe('getTransformation', () => {
    it('should return the transformation when found', async () => {
      const mock = createMockSupabase();
      const expected = makeSampleTransformation();
      mock.mockSingle.mockResolvedValue({ data: expected, error: null });
      setupMockClient(mock);

      const result = await getTransformation('txn-001');

      expect(result).toEqual(expected);
      expect(mock.mockFrom).toHaveBeenCalledWith('transformations');
      expect(mock.chainable.select).toHaveBeenCalled();
      expect(mock.chainable.eq).toHaveBeenCalledWith('id', 'txn-001');
      expect(mock.mockSingle).toHaveBeenCalled();
    });

    it('should return null when not found (PGRST116)', async () => {
      const mock = createMockSupabase();
      mock.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });
      setupMockClient(mock);

      const result = await getTransformation('txn-nonexistent');

      expect(result).toBeNull();
    });

    it('should throw for non-PGRST116 errors', async () => {
      const mock = createMockSupabase();
      mock.mockSingle.mockResolvedValue({
        data: null,
        error: { code: '42P01', message: 'relation does not exist' },
      });
      setupMockClient(mock);

      await expect(getTransformation('txn-001')).rejects.toThrow(
        'Failed to get transformation: relation does not exist'
      );
    });
  });

  // -----------------------------------------------------------------------
  // getUserTransformations
  // -----------------------------------------------------------------------
  describe('getUserTransformations', () => {
    it('should return a list of transformations for the user', async () => {
      const mock = createMockSupabase();
      const rows = [
        makeSampleTransformation({ id: 'txn-001' }),
        makeSampleTransformation({ id: 'txn-002', style: 'watercolor' }),
      ];
      mock.setChainableResult({ data: rows, error: null });
      setupMockClient(mock);

      const result = await getUserTransformations('user-123');

      expect(result).toEqual(rows);
      expect(mock.mockFrom).toHaveBeenCalledWith('transformations');
      expect(mock.chainable.select).toHaveBeenCalled();
      expect(mock.chainable.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mock.chainable.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mock.chainable.limit).toHaveBeenCalledWith(50);
    });

    it('should respect a custom limit', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({ data: [], error: null });
      setupMockClient(mock);

      await getUserTransformations('user-123', 10);

      expect(mock.chainable.limit).toHaveBeenCalledWith(10);
    });

    it('should throw when supabase returns an error', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({
        data: null,
        error: { message: 'RLS policy violation' },
      });
      setupMockClient(mock);

      await expect(getUserTransformations('user-123')).rejects.toThrow(
        'Failed to get user transformations: RLS policy violation'
      );
    });
  });

  // -----------------------------------------------------------------------
  // getUserCost
  // -----------------------------------------------------------------------
  describe('getUserCost', () => {
    const start = new Date('2026-01-01T00:00:00Z');
    const end = new Date('2026-01-31T23:59:59Z');

    it('should sum estimated_cost for completed transformations in the date range', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({
        data: [
          { estimated_cost: 0.039 },
          { estimated_cost: 0.039 },
          { estimated_cost: 0.039 },
        ],
        error: null,
      });
      setupMockClient(mock);

      const result = await getUserCost('user-123', start, end);

      expect(result).toBeCloseTo(0.117);
      expect(mock.chainable.select).toHaveBeenCalledWith('estimated_cost');
      expect(mock.chainable.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mock.chainable.eq).toHaveBeenCalledWith('status', 'completed');
      expect(mock.chainable.gte).toHaveBeenCalledWith('created_at', start.toISOString());
      expect(mock.chainable.lte).toHaveBeenCalledWith('created_at', end.toISOString());
    });

    it('should return 0 when there are no matching records', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({ data: [], error: null });
      setupMockClient(mock);

      const result = await getUserCost('user-123', start, end);

      expect(result).toBe(0);
    });

    it('should handle null estimated_cost values gracefully', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({
        data: [
          { estimated_cost: 0.039 },
          { estimated_cost: null },
          { estimated_cost: 0.039 },
        ],
        error: null,
      });
      setupMockClient(mock);

      const result = await getUserCost('user-123', start, end);

      expect(result).toBeCloseTo(0.078);
    });

    it('should throw when supabase returns an error', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({
        data: null,
        error: { message: 'invalid date range' },
      });
      setupMockClient(mock);

      await expect(getUserCost('user-123', start, end)).rejects.toThrow(
        'Failed to get user cost: invalid date range'
      );
    });
  });

  // -----------------------------------------------------------------------
  // getTransformationStats
  // -----------------------------------------------------------------------
  describe('getTransformationStats', () => {
    it('should compute aggregate stats from all transformations', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({
        data: [
          makeSampleTransformation({
            id: 'txn-001',
            status: 'completed',
            provider: 'nano-banana',
            style: 'pop_art',
            estimated_cost: 0.039,
            processing_time_ms: 2000,
          }),
          makeSampleTransformation({
            id: 'txn-002',
            status: 'completed',
            provider: 'nano-banana',
            style: 'watercolor',
            estimated_cost: 0.039,
            processing_time_ms: 3000,
          }),
          makeSampleTransformation({
            id: 'txn-003',
            status: 'failed',
            provider: 'replicate',
            style: 'pop_art',
            estimated_cost: null,
            processing_time_ms: null,
          }),
        ],
        error: null,
      });
      setupMockClient(mock);

      const stats = await getTransformationStats();

      expect(stats.totalTransformations).toBe(3);
      expect(stats.successfulTransformations).toBe(2);
      expect(stats.failedTransformations).toBe(1);
      expect(stats.totalCost).toBeCloseTo(0.078);
      expect(stats.averageProcessingTime).toBe(2500);
      expect(stats.byProvider).toEqual({ 'nano-banana': 2, replicate: 1 });
      expect(stats.byStyle).toEqual({ pop_art: 2, watercolor: 1 });
    });

    it('should apply date filters when startDate and endDate are provided', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({ data: [], error: null });
      setupMockClient(mock);

      const start = new Date('2026-01-01T00:00:00Z');
      const end = new Date('2026-01-31T23:59:59Z');

      await getTransformationStats(start, end);

      expect(mock.chainable.gte).toHaveBeenCalledWith('created_at', start.toISOString());
      expect(mock.chainable.lte).toHaveBeenCalledWith('created_at', end.toISOString());
    });

    it('should not apply date filters when dates are omitted', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({ data: [], error: null });
      setupMockClient(mock);

      await getTransformationStats();

      expect(mock.chainable.gte).not.toHaveBeenCalled();
      expect(mock.chainable.lte).not.toHaveBeenCalled();
    });

    it('should return zeroed stats when no data exists', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({ data: [], error: null });
      setupMockClient(mock);

      const stats = await getTransformationStats();

      expect(stats.totalTransformations).toBe(0);
      expect(stats.successfulTransformations).toBe(0);
      expect(stats.failedTransformations).toBe(0);
      expect(stats.totalCost).toBe(0);
      expect(stats.averageProcessingTime).toBe(0);
      expect(stats.byProvider).toEqual({});
      expect(stats.byStyle).toEqual({});
    });

    it('should throw when supabase returns an error', async () => {
      const mock = createMockSupabase();
      mock.setChainableResult({
        data: null,
        error: { message: 'table not found' },
      });
      setupMockClient(mock);

      await expect(getTransformationStats()).rejects.toThrow(
        'Failed to get stats: table not found'
      );
    });
  });

  // -----------------------------------------------------------------------
  // findExistingTransformation
  // -----------------------------------------------------------------------
  describe('findExistingTransformation', () => {
    it('should return a matching completed transformation (cache hit)', async () => {
      const mock = createMockSupabase();
      const expected = makeSampleTransformation();
      mock.mockSingle.mockResolvedValue({ data: expected, error: null });
      setupMockClient(mock);

      const result = await findExistingTransformation('originals/photo.jpg', 'pop_art');

      expect(result).toEqual(expected);
      expect(mock.mockFrom).toHaveBeenCalledWith('transformations');
      expect(mock.chainable.select).toHaveBeenCalled();
      expect(mock.chainable.eq).toHaveBeenCalledWith('original_image_key', 'originals/photo.jpg');
      expect(mock.chainable.eq).toHaveBeenCalledWith('style', 'pop_art');
      expect(mock.chainable.eq).toHaveBeenCalledWith('status', 'completed');
      expect(mock.chainable.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mock.chainable.limit).toHaveBeenCalledWith(1);
      expect(mock.mockSingle).toHaveBeenCalled();
    });

    it('should return null when not found (PGRST116)', async () => {
      const mock = createMockSupabase();
      mock.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows found' },
      });
      setupMockClient(mock);

      const result = await findExistingTransformation('originals/new.jpg', 'pop_art');

      expect(result).toBeNull();
    });

    it('should return null (cache miss) for non-PGRST116 errors instead of throwing', async () => {
      const mock = createMockSupabase();
      mock.mockSingle.mockResolvedValue({
        data: null,
        error: { code: '42P01', message: 'relation does not exist' },
      });
      setupMockClient(mock);

      const result = await findExistingTransformation('originals/photo.jpg', 'pop_art');

      // Unlike getTransformation, this function returns null for any error
      expect(result).toBeNull();
    });
  });
});
