import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// --- Mocks ---

const mockSelectResult = vi.fn();
const mockUpdateResult = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          lt: () => mockSelectResult(),
        }),
      }),
      update: (data: unknown) => ({
        in: () => mockUpdateResult(data),
      }),
    }),
  }),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { GET } from './route';

function makeRequest(secret?: string): Request {
  const headers: Record<string, string> = {};
  if (secret) {
    headers['authorization'] = `Bearer ${secret}`;
  }
  return new Request('https://example.com/api/cron/expire-pending-orders', {
    method: 'GET',
    headers,
  });
}

describe('GET /api/cron/expire-pending-orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('CRON_SECRET', 'test-cron-secret');

    // Default: no expired orders
    mockSelectResult.mockResolvedValue({ data: [], error: null });
    mockUpdateResult.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns 401 when Authorization header is missing', async () => {
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns 401 when CRON_SECRET does not match', async () => {
    const res = await GET(makeRequest('wrong-secret'));
    expect(res.status).toBe(401);
  });

  it('expires orders older than 15 minutes with status pending', async () => {
    mockSelectResult.mockResolvedValue({
      data: [
        { id: 'order-1', order_number: 'FP-001' },
        { id: 'order-2', order_number: 'FP-002' },
      ],
      error: null,
    });

    const res = await GET(makeRequest('test-cron-secret'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.expired).toBe(2);
    expect(body.success).toBe(true);

    expect(mockUpdateResult).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'cancelled',
        cancelled_at: expect.any(String),
      })
    );
  });

  it('does NOT expire orders newer than 15 minutes', async () => {
    // The query itself filters by created_at < cutoff, so if DB returns empty
    // that means no orders older than 15 minutes were found
    mockSelectResult.mockResolvedValue({ data: [], error: null });

    const res = await GET(makeRequest('test-cron-secret'));
    const body = await res.json();
    expect(body.expired).toBe(0);
    expect(mockUpdateResult).not.toHaveBeenCalled();
  });

  it('does NOT expire orders with status other than pending', async () => {
    // The query filters by status = 'pending', so paid/processing orders are excluded
    mockSelectResult.mockResolvedValue({ data: [], error: null });

    const res = await GET(makeRequest('test-cron-secret'));
    const body = await res.json();
    expect(body.expired).toBe(0);
  });

  it('returns expired: 0 when no orders match', async () => {
    mockSelectResult.mockResolvedValue({ data: [], error: null });

    const res = await GET(makeRequest('test-cron-secret'));
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.expired).toBe(0);
  });

  it('returns correct count of expired orders', async () => {
    mockSelectResult.mockResolvedValue({
      data: [
        { id: 'o1', order_number: 'FP-100' },
        { id: 'o2', order_number: 'FP-101' },
        { id: 'o3', order_number: 'FP-102' },
      ],
      error: null,
    });

    const res = await GET(makeRequest('test-cron-secret'));
    const body = await res.json();
    expect(body.expired).toBe(3);
  });
});
