import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => undefined,
    set: () => {},
  }),
}));

// Mock dependencies
const mockCreatePaymentLink = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/payments/payplus', () => ({
  createPaymentLink: (...args: unknown[]) => mockCreatePaymentLink(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: () => mockGetUser(),
    },
  }),
}));

// Mock rate limiting to skip Upstash Redis in tests
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

// Mock environment variables
const mockEnv = {
  PAYPLUS_API_KEY: 'test_api_key',
  PAYPLUS_SECRET_KEY: 'test_secret_key',
  PAYPLUS_PAYMENT_PAGE_UID: 'test_page_uid',
  NEXT_PUBLIC_APP_URL: 'https://footprint.co.il',
};

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.entries(mockEnv).forEach(([key, value]) => {
      vi.stubEnv(key, value);
    });

    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user123', email: 'test@example.com' } },
      error: null,
    });

    // Default mock return
    mockCreatePaymentLink.mockResolvedValue({
      pageRequestUid: 'page_request_123',
      paymentUrl: 'https://payments.payplus.co.il/test',
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Successful checkout', () => {
    it('should create payment link and return URL', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: 15800,
          customerName: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pageRequestUid).toBe('page_request_123');
      expect(data.paymentUrl).toBe('https://payments.payplus.co.il/test');
    });

    it('should call createPaymentLink with correct parameters', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_456',
          amount: 25000,
          customerName: 'Test User',
        }),
      });

      await POST(request);

      expect(mockCreatePaymentLink).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order_456',
          amount: 25000,
          customerEmail: 'test@example.com',
          customerName: 'Test User',
        })
      );
    });

    it('should include success, failure, and callback URLs', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: 15800,
          customerName: 'Test User',
        }),
      });

      await POST(request);

      expect(mockCreatePaymentLink).toHaveBeenCalledWith(
        expect.objectContaining({
          successUrl: expect.stringContaining('/create/complete'),
          failureUrl: expect.stringContaining('/create/checkout'),
          callbackUrl: expect.stringContaining('/api/webhooks/payplus'),
        })
      );
    });

    it('should handle user without email', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user123', email: null } },
        error: null,
      });

      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: 15800,
          customerName: 'Test User',
          customerEmail: 'provided@example.com',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      expect(mockCreatePaymentLink).toHaveBeenCalledWith(
        expect.objectContaining({
          customerEmail: 'provided@example.com',
        })
      );
    });

    it('should include phone number if provided', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: 15800,
          customerName: 'Test User',
          customerPhone: '0501234567',
        }),
      });

      await POST(request);

      expect(mockCreatePaymentLink).toHaveBeenCalledWith(
        expect.objectContaining({
          customerPhone: '0501234567',
        })
      );
    });
  });

  describe('Authentication', () => {
    it('should return 401 for unauthenticated users', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: 15800,
          customerName: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });
  });

  describe('Validation', () => {
    it('should return 400 for missing orderId', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 15800,
          customerName: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('orderId');
    });

    it('should return 400 for missing amount', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          customerName: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('amount');
    });

    it('should return 400 for missing customerName', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: 15800,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('customerName');
    });

    it('should return 400 for negative amount', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: -100,
          customerName: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid amount');
    });

    it('should return 400 for zero amount', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: 0,
          customerName: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid amount');
    });

    it('should return 400 for non-integer amount', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: 158.5,
          customerName: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid amount');
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('Error handling', () => {
    it('should return 500 when PayPlus fails', async () => {
      mockCreatePaymentLink.mockRejectedValue(new Error('PayPlus error'));

      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: 15800,
          customerName: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('payment');
    });
  });

  describe('Response format', () => {
    it('should return correct response structure', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: 15800,
          customerName: 'Test User',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('pageRequestUid');
      expect(data).toHaveProperty('paymentUrl');
      expect(typeof data.pageRequestUid).toBe('string');
      expect(typeof data.paymentUrl).toBe('string');
    });
  });
});
