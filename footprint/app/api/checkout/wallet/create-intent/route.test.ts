/**
 * Wallet Payment Intent API Route Tests
 *
 * TDD: Tests written FIRST before implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => undefined,
    set: () => {},
  }),
}));

// Mock the stripe module - must be at top level before imports
vi.mock('@/lib/payments/stripe', () => ({
  createWalletPaymentIntent: vi.fn(),
}));

const mockGetUser = vi.fn();

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

// Import after mocking
import { POST } from './route';
import { createWalletPaymentIntent } from '@/lib/payments/stripe';

// Cast to mock for type-safety
const mockCreateWalletPaymentIntent = createWalletPaymentIntent as ReturnType<
  typeof vi.fn
>;

describe('POST /api/checkout/wallet/create-intent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user123', email: 'test@example.com' } },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createRequest(body: object): NextRequest {
    return new NextRequest('http://localhost:3000/api/checkout/wallet/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  it('should create payment intent and return client secret', async () => {
    mockCreateWalletPaymentIntent.mockResolvedValue({
      paymentIntentId: 'pi_test_123',
      clientSecret: 'pi_test_123_secret_abc',
    });

    const request = createRequest({
      orderId: 'order_123',
      amount: 15000,
      currency: 'ils',
      customerEmail: 'test@example.com',
      description: 'Pop Art Print - A4',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({
      paymentIntentId: 'pi_test_123',
      clientSecret: 'pi_test_123_secret_abc',
    });

    expect(mockCreateWalletPaymentIntent).toHaveBeenCalledWith({
      orderId: 'order_123',
      amount: 15000,
      currency: 'ils',
      customerEmail: 'test@example.com',
      description: 'Pop Art Print - A4',
    });
  });

  it('should return 400 for missing orderId', async () => {
    const request = createRequest({
      amount: 15000,
      currency: 'ils',
      customerEmail: 'test@example.com',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('orderId');
  });

  it('should return 400 for missing amount', async () => {
    const request = createRequest({
      orderId: 'order_123',
      currency: 'ils',
      customerEmail: 'test@example.com',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('amount');
  });

  it('should return 400 for invalid amount', async () => {
    const request = createRequest({
      orderId: 'order_123',
      amount: -100,
      currency: 'ils',
      customerEmail: 'test@example.com',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('amount');
  });

  it('should return 400 for missing customerEmail', async () => {
    const request = createRequest({
      orderId: 'order_123',
      amount: 15000,
      currency: 'ils',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('customerEmail');
  });

  it('should return 400 for invalid currency', async () => {
    const request = createRequest({
      orderId: 'order_123',
      amount: 15000,
      currency: 'xxx',
      customerEmail: 'test@example.com',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('currency');
  });

  it('should default to ILS currency when not provided', async () => {
    mockCreateWalletPaymentIntent.mockResolvedValue({
      paymentIntentId: 'pi_default',
      clientSecret: 'pi_default_secret',
    });

    const request = createRequest({
      orderId: 'order_123',
      amount: 15000,
      customerEmail: 'test@example.com',
    });

    await POST(request);

    expect(mockCreateWalletPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: 'ils',
      })
    );
  });

  it('should return 500 when stripe service fails', async () => {
    mockCreateWalletPaymentIntent.mockRejectedValue(
      new Error('Failed to create payment intent: Stripe error')
    );

    const request = createRequest({
      orderId: 'order_123',
      amount: 15000,
      currency: 'ils',
      customerEmail: 'test@example.com',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('payment');
  });

  it('should return 400 for malformed JSON body', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/checkout/wallet/create-intent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'not valid json',
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 401 for unauthenticated users', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const request = createRequest({
      orderId: 'order_123',
      amount: 15000,
      customerEmail: 'test@example.com',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('Unauthorized');
  });
});
