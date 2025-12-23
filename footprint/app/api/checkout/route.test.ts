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
const mockCreateCheckoutSession = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/payments/stripe', () => ({
  createCheckoutSession: (...args: unknown[]) => mockCreateCheckoutSession(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: () => mockGetUser(),
    },
  }),
}));

// Mock environment variables
const mockEnv = {
  STRIPE_SECRET_KEY: 'sk_test_123',
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
    mockCreateCheckoutSession.mockResolvedValue({
      sessionId: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Successful checkout', () => {
    it('should create checkout session and return URL', async () => {
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

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe('cs_test_123');
      expect(data.url).toBe('https://checkout.stripe.com/test');
    });

    it('should call createCheckoutSession with correct parameters', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_456',
          amount: 25000,
        }),
      });

      await POST(request);

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order_456',
          amount: 25000,
          customerEmail: 'test@example.com',
        })
      );
    });

    it('should include success and cancel URLs', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: 15800,
        }),
      });

      await POST(request);

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          successUrl: expect.stringContaining('/create/complete'),
          cancelUrl: expect.stringContaining('/create/checkout'),
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
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          customerEmail: undefined,
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
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('amount');
    });

    it('should return 400 for negative amount', async () => {
      const request = new Request('http://localhost/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'order_123',
          amount: -100,
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
    it('should return 500 when Stripe fails', async () => {
      mockCreateCheckoutSession.mockRejectedValue(new Error('Stripe error'));

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

      expect(response.status).toBe(500);
      expect(data.error).toContain('checkout session');
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
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty('sessionId');
      expect(data).toHaveProperty('url');
      expect(typeof data.sessionId).toBe('string');
      expect(typeof data.url).toBe('string');
    });
  });
});
