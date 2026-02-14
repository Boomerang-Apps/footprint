import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('@/lib/payments/payplus', () => ({
  getPayPlusConfig: () => ({
    apiKey: 'test_api_key',
    secretKey: 'test_secret_key',
    paymentPageUid: 'test_page_uid',
    sandbox: true,
    baseUrl: 'https://restapidev.payplus.co.il/api/v1.0',
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

import { processRefund } from './refund';

describe('processRefund', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: { status: 'success', code: 0 },
        data: { transaction_uid: 'refund-txn-001' },
      }),
    });

    await processRefund({ transactionUid: 'txn-123', amount: 15800 });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://restapidev.payplus.co.il/api/v1.0/Transactions/RefundByTransactionUID',
      expect.any(Object)
    );
  });

  it('sends correct auth headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: { status: 'success', code: 0 },
        data: { transaction_uid: 'refund-txn-001' },
      }),
    });

    await processRefund({ transactionUid: 'txn-123', amount: 15800 });

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders['api-key']).toBe('test_api_key');
    expect(callHeaders['secret-key']).toBe('test_secret_key');
  });

  it('converts agorot to ILS', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: { status: 'success', code: 0 },
        data: { transaction_uid: 'refund-txn-001' },
      }),
    });

    await processRefund({ transactionUid: 'txn-123', amount: 15800 });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.amount).toBe(158);
  });

  it('returns success with refund transaction UID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: { status: 'success', code: 0 },
        data: { transaction_uid: 'refund-txn-001' },
      }),
    });

    const result = await processRefund({ transactionUid: 'txn-123', amount: 15800 });

    expect(result.success).toBe(true);
    expect(result.refundTransactionUid).toBe('refund-txn-001');
  });

  it('returns failure on PayPlus API error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: {
          status: 'error',
          code: 100,
          description: 'Insufficient funds for refund',
        },
      }),
    });

    const result = await processRefund({ transactionUid: 'txn-123', amount: 15800 });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('Insufficient funds for refund');
  });

  it('returns failure on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

    const result = await processRefund({ transactionUid: 'txn-123', amount: 15800 });

    expect(result.success).toBe(false);
    expect(result.errorMessage).toBe('Network timeout');
  });

  it('never throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('catastrophic'));

    const result = await processRefund({ transactionUid: 'txn-123', amount: 15800 });

    expect(result).toBeDefined();
    expect(result.success).toBe(false);
  });

  it('includes more_info reason when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: { status: 'success', code: 0 },
        data: { transaction_uid: 'refund-txn-001' },
      }),
    });

    await processRefund({
      transactionUid: 'txn-123',
      amount: 15800,
      reason: 'Customer requested refund',
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.more_info).toBe('Customer requested refund');
  });
});
