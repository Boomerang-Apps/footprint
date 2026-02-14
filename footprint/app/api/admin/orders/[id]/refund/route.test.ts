import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockVerifyAdmin = vi.fn();
vi.mock('@/lib/auth/admin', () => ({
  verifyAdmin: () => mockVerifyAdmin(),
}));

const mockCheckRateLimit = vi.fn();
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

const mockOrderSelect = vi.fn();
const mockPaymentSelect = vi.fn();
const mockPaymentUpdate = vi.fn();
const mockOrderUpdate = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'orders') {
        return {
          select: () => ({
            eq: () => ({
              single: () => mockOrderSelect(),
            }),
          }),
          update: (data: unknown) => {
            mockOrderUpdate(data);
            return { eq: () => Promise.resolve({ error: null }) };
          },
        };
      }
      if (table === 'payments') {
        return {
          select: () => ({
            eq: (col: string, val: unknown) => ({
              eq: () => ({
                single: () => mockPaymentSelect(),
              }),
            }),
          }),
          update: (data: unknown) => {
            mockPaymentUpdate(data);
            return { eq: () => Promise.resolve({ error: null }) };
          },
        };
      }
      return {};
    },
  }),
}));

const mockProcessRefund = vi.fn();
vi.mock('@/lib/payments/refund', () => ({
  processRefund: (params: unknown) => mockProcessRefund(params),
}));

const mockCreatePaymentRecord = vi.fn();
vi.mock('@/lib/payments/record', () => ({
  createPaymentRecord: (params: unknown) => mockCreatePaymentRecord(params),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { POST } from './route';

function makeRequest(body: unknown): Request {
  return new Request('https://example.com/api/admin/orders/order-123/refund', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const routeParams = { params: Promise.resolve({ id: 'order-123' }) };

describe('POST /api/admin/orders/[id]/refund', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: admin authorized
    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: true,
      user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' },
    });

    // Default: no rate limit
    mockCheckRateLimit.mockResolvedValue(null);

    // Default: order found and refundable
    mockOrderSelect.mockResolvedValue({
      data: { id: 'order-123', order_number: 'FP-001', status: 'paid' },
      error: null,
    });

    // Default: payment found
    mockPaymentSelect.mockResolvedValue({
      data: {
        id: 'payment-456',
        external_transaction_id: 'txn-789',
        amount: 15800,
      },
      error: null,
    });

    // Default: refund succeeds
    mockProcessRefund.mockResolvedValue({
      success: true,
      refundTransactionUid: 'refund-txn-001',
    });

    // Default: payment record creation succeeds
    mockCreatePaymentRecord.mockResolvedValue({ success: true });
  });

  it('returns 401 when user is not authenticated', async () => {
    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: false,
      error: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }),
    });

    // Need to return a NextResponse-like object
    const { NextResponse } = await import('next/server');
    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    });

    const res = await POST(makeRequest({ amount: 5000 }), routeParams);
    expect(res.status).toBe(401);
  });

  it('returns 403 when user is not admin', async () => {
    const { NextResponse } = await import('next/server');
    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: false,
      error: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    });

    const res = await POST(makeRequest({ amount: 5000 }), routeParams);
    expect(res.status).toBe(403);
  });

  it('returns 429 when rate limited', async () => {
    const { NextResponse } = await import('next/server');
    mockCheckRateLimit.mockResolvedValue(
      NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    );

    const res = await POST(makeRequest({ amount: 5000 }), routeParams);
    expect(res.status).toBe(429);
  });

  it('returns 400 when amount is missing', async () => {
    const res = await POST(makeRequest({}), routeParams);
    expect(res.status).toBe(400);
  });

  it('returns 400 when amount is negative or zero', async () => {
    const res1 = await POST(makeRequest({ amount: -100 }), routeParams);
    expect(res1.status).toBe(400);

    const res2 = await POST(makeRequest({ amount: 0 }), routeParams);
    expect(res2.status).toBe(400);
  });

  it('returns 400 when amount exceeds payment amount', async () => {
    const res = await POST(makeRequest({ amount: 20000 }), routeParams);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('exceeds');
  });

  it('returns 404 when order not found', async () => {
    mockOrderSelect.mockResolvedValue({ data: null, error: { message: 'not found' } });

    const res = await POST(makeRequest({ amount: 5000 }), routeParams);
    expect(res.status).toBe(404);
  });

  it('returns 400 when order status is not refundable', async () => {
    mockOrderSelect.mockResolvedValue({
      data: { id: 'order-123', order_number: 'FP-001', status: 'cancelled' },
      error: null,
    });

    const res = await POST(makeRequest({ amount: 5000 }), routeParams);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('cancelled');
  });

  it('returns 400 when no succeeded payment record exists', async () => {
    mockPaymentSelect.mockResolvedValue({ data: null, error: { message: 'not found' } });

    const res = await POST(makeRequest({ amount: 5000 }), routeParams);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('No succeeded payment');
  });

  it('processes full refund: updates payment + order status', async () => {
    const res = await POST(makeRequest({ amount: 15800 }), routeParams);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.isPartialRefund).toBe(false);

    expect(mockProcessRefund).toHaveBeenCalledWith({
      transactionUid: 'txn-789',
      amount: 15800,
      reason: undefined,
    });

    expect(mockPaymentUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'refunded' })
    );
    expect(mockOrderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'refunded' })
    );
  });

  it('processes partial refund: inserts negative record, order unchanged', async () => {
    const res = await POST(makeRequest({ amount: 5000 }), routeParams);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.isPartialRefund).toBe(true);
    expect(body.refundedAmount).toBe(5000);

    expect(mockCreatePaymentRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order-123',
        provider: 'payplus',
        status: 'refunded',
        amount: -5000,
      })
    );
  });

  it('does NOT update order status on partial refund', async () => {
    await POST(makeRequest({ amount: 5000 }), routeParams);
    expect(mockOrderUpdate).not.toHaveBeenCalled();
  });

  it('returns 502 when PayPlus refund API fails', async () => {
    mockProcessRefund.mockResolvedValue({
      success: false,
      errorMessage: 'Insufficient funds',
    });

    const res = await POST(makeRequest({ amount: 5000 }), routeParams);
    expect(res.status).toBe(502);
  });

  it('does NOT update DB when PayPlus call fails', async () => {
    mockProcessRefund.mockResolvedValue({
      success: false,
      errorMessage: 'API error',
    });

    await POST(makeRequest({ amount: 5000 }), routeParams);
    expect(mockPaymentUpdate).not.toHaveBeenCalled();
    expect(mockOrderUpdate).not.toHaveBeenCalled();
    expect(mockCreatePaymentRecord).not.toHaveBeenCalled();
  });
});
