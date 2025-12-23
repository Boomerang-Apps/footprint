import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';
import crypto from 'crypto';

// Mock dependencies
const mockValidateWebhook = vi.fn();

vi.mock('@/lib/payments/payplus', () => ({
  validateWebhook: (...args: unknown[]) => mockValidateWebhook(...args),
}));

// Mock environment variables
const mockEnv = {
  PAYPLUS_SECRET_KEY: 'test_secret_key',
};

// Helper to create valid hash
function createValidHash(body: string, secretKey: string): string {
  return crypto
    .createHmac('sha256', secretKey)
    .update(body)
    .digest('base64');
}

describe('POST /api/webhooks/payplus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.entries(mockEnv).forEach(([key, value]) => {
      vi.stubEnv(key, value);
    });

    // Default: valid webhook
    mockValidateWebhook.mockReturnValue(true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Signature verification', () => {
    it('should return 400 for missing hash header', async () => {
      const body = JSON.stringify({ transaction_uid: 'tx_123' });

      const request = new Request('http://localhost/api/webhooks/payplus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'PayPlus',
        },
        body,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('hash');
    });

    it('should return 400 for invalid user-agent', async () => {
      const body = JSON.stringify({ transaction_uid: 'tx_123' });
      const hash = createValidHash(body, 'test_secret_key');

      const request = new Request('http://localhost/api/webhooks/payplus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'NotPayPlus',
          hash,
        },
        body,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('user-agent');
    });

    it('should return 400 for invalid hash signature', async () => {
      mockValidateWebhook.mockReturnValue(false);

      const body = JSON.stringify({ transaction_uid: 'tx_123' });

      const request = new Request('http://localhost/api/webhooks/payplus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'PayPlus',
          hash: 'invalid_hash',
        },
        body,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('signature');
    });

    it('should verify signature with correct parameters', async () => {
      const body = JSON.stringify({ transaction_uid: 'tx_123' });
      const hash = 'test_hash';

      const request = new Request('http://localhost/api/webhooks/payplus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'PayPlus',
          hash,
        },
        body,
      });

      await POST(request);

      expect(mockValidateWebhook).toHaveBeenCalledWith(
        body,
        hash,
        'test_secret_key'
      );
    });
  });

  describe('Transaction handling', () => {
    it('should process successful transaction', async () => {
      const body = JSON.stringify({
        transaction_uid: 'tx_123',
        page_request_uid: 'req_123',
        status_code: '000',
        amount: 158,
        more_info: 'order_123',
      });
      const hash = createValidHash(body, 'test_secret_key');

      const request = new Request('http://localhost/api/webhooks/payplus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'PayPlus',
          hash,
        },
        body,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('should handle failed transaction', async () => {
      const body = JSON.stringify({
        transaction_uid: 'tx_123',
        page_request_uid: 'req_123',
        status_code: '100', // Non-success status
        amount: 158,
        more_info: 'order_123',
      });
      const hash = createValidHash(body, 'test_secret_key');

      const request = new Request('http://localhost/api/webhooks/payplus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'PayPlus',
          hash,
        },
        body,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('should handle missing orderId in more_info', async () => {
      const body = JSON.stringify({
        transaction_uid: 'tx_123',
        page_request_uid: 'req_123',
        status_code: '000',
        amount: 158,
        // Missing more_info
      });
      const hash = createValidHash(body, 'test_secret_key');

      const request = new Request('http://localhost/api/webhooks/payplus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'PayPlus',
          hash,
        },
        body,
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Response format', () => {
    it('should return received: true on success', async () => {
      const body = JSON.stringify({
        transaction_uid: 'tx_123',
        status_code: '000',
      });
      const hash = createValidHash(body, 'test_secret_key');

      const request = new Request('http://localhost/api/webhooks/payplus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'PayPlus',
          hash,
        },
        body,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toEqual({ received: true });
    });
  });

  describe('Environment validation', () => {
    it('should return 500 when secret key is missing', async () => {
      vi.stubEnv('PAYPLUS_SECRET_KEY', '');

      const body = JSON.stringify({ transaction_uid: 'tx_123' });

      const request = new Request('http://localhost/api/webhooks/payplus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-agent': 'PayPlus',
          hash: 'some_hash',
        },
        body,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('secret');
    });
  });
});
