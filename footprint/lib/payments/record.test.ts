import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock createAdminClient
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (mockFrom.callCount === undefined) mockFrom.callCount = 0;
      mockFrom.callCount++;
      mockFrom.lastTable = table;
      return {
        select: mockSelect,
        insert: mockInsert,
      };
    },
  }),
}));

const mockFrom = { callCount: 0, lastTable: '' };

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

import { createPaymentRecord, type CreatePaymentRecordParams } from './record';

describe('createPaymentRecord', () => {
  const baseParams: CreatePaymentRecordParams = {
    orderId: 'order-123',
    provider: 'payplus',
    status: 'succeeded',
    externalTransactionId: 'txn-456',
    amount: 15800,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.callCount = 0;

    // Default: no existing record (select returns null)
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: null, error: null });

    // Default: insert succeeds
    mockInsert.mockReturnValue({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: { id: 'payment-789' },
            error: null,
          }),
      }),
    });
  });

  it('creates record with all fields mapped correctly', async () => {
    const params: CreatePaymentRecordParams = {
      ...baseParams,
      externalId: 'page-req-001',
      currency: 'USD',
      installments: 3,
      cardLastFour: '4242',
      cardBrand: 'visa',
      errorCode: null as unknown as string,
      webhookPayload: { foo: 'bar' },
    };

    const result = await createPaymentRecord(params);

    expect(result.success).toBe(true);
    expect(result.paymentId).toBe('payment-789');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'order-123',
        provider: 'payplus',
        status: 'succeeded',
        external_id: 'page-req-001',
        external_transaction_id: 'txn-456',
        amount: 15800,
        currency: 'USD',
        installments: 3,
        card_last_four: '4242',
        card_brand: 'visa',
        webhook_payload: { foo: 'bar' },
      })
    );
  });

  it('defaults currency to ILS and installments to 1', async () => {
    await createPaymentRecord(baseParams);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: 'ILS',
        installments: 1,
      })
    );
  });

  it('returns alreadyExists when duplicate external_transaction_id found', async () => {
    mockSingle.mockResolvedValue({
      data: { id: 'existing-payment-111' },
      error: null,
    });

    const result = await createPaymentRecord(baseParams);

    expect(result.success).toBe(true);
    expect(result.alreadyExists).toBe(true);
    expect(result.paymentId).toBe('existing-payment-111');
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('sets completed_at when status is succeeded', async () => {
    await createPaymentRecord({ ...baseParams, status: 'succeeded' });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        completed_at: expect.any(String),
      })
    );

    const insertArg = mockInsert.mock.calls[0][0];
    expect(insertArg.completed_at).not.toBeNull();
  });

  it('skips completed_at for failed status', async () => {
    await createPaymentRecord({ ...baseParams, status: 'failed' });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        completed_at: null,
      })
    );
  });

  it('stores webhook_payload as JSONB', async () => {
    const payload = { transaction_uid: 'abc', amount: 158, nested: { a: 1 } };
    await createPaymentRecord({ ...baseParams, webhookPayload: payload });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        webhook_payload: payload,
      })
    );
  });

  it('handles missing optional fields gracefully', async () => {
    await createPaymentRecord(baseParams);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        external_id: null,
        card_last_four: null,
        card_brand: null,
        error_code: null,
        error_message: null,
        webhook_payload: null,
      })
    );
  });

  it('returns success false on database error and never throws', async () => {
    mockInsert.mockReturnValue({
      select: () => ({
        single: () =>
          Promise.resolve({
            data: null,
            error: { message: 'DB connection failed', code: '500' },
          }),
      }),
    });

    const result = await createPaymentRecord(baseParams);

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB connection failed');
    expect(result.paymentId).toBeUndefined();
  });
});
