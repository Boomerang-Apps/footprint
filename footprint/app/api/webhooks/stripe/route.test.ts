/**
 * Stripe Webhook Handler Tests
 *
 * TDD: Tests written FIRST before implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import type Stripe from 'stripe';

// Mock the stripe module
vi.mock('@/lib/payments/stripe', () => ({
  validateStripeWebhook: vi.fn(),
}));

// Import after mocking
import { POST } from './route';
import { validateStripeWebhook } from '@/lib/payments/stripe';

const mockValidateStripeWebhook = validateStripeWebhook as ReturnType<typeof vi.fn>;

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createRequest(body: string, signature = 'valid_signature'): NextRequest {
    return new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      body,
    });
  }

  function createStripeEvent(
    type: string,
    data: Record<string, unknown> = {}
  ): Stripe.Event {
    return {
      id: 'evt_test_123',
      type: type as Stripe.Event['type'],
      object: 'event',
      api_version: '2023-10-16',
      created: Date.now(),
      livemode: false,
      pending_webhooks: 0,
      request: null,
      data: {
        object: {
          id: 'pi_test_123',
          metadata: { orderId: 'order_123' },
          ...data,
        },
      },
    } as Stripe.Event;
  }

  it('should handle payment_intent.succeeded event', async () => {
    const event = createStripeEvent('payment_intent.succeeded');
    mockValidateStripeWebhook.mockResolvedValue(event);

    const request = createRequest(JSON.stringify(event));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(data.orderId).toBe('order_123');
    expect(data.status).toBe('succeeded');
  });

  it('should handle payment_intent.payment_failed event', async () => {
    const event = createStripeEvent('payment_intent.payment_failed', {
      last_payment_error: { message: 'Card declined' },
    });
    mockValidateStripeWebhook.mockResolvedValue(event);

    const request = createRequest(JSON.stringify(event));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(data.status).toBe('failed');
  });

  it('should handle payment_intent.canceled event', async () => {
    const event = createStripeEvent('payment_intent.canceled');
    mockValidateStripeWebhook.mockResolvedValue(event);

    const request = createRequest(JSON.stringify(event));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(data.status).toBe('canceled');
  });

  it('should acknowledge unhandled event types', async () => {
    const event = createStripeEvent('some.other.event');
    mockValidateStripeWebhook.mockResolvedValue(event);

    const request = createRequest(JSON.stringify(event));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.received).toBe(true);
    expect(data.handled).toBe(false);
  });

  it('should return 400 for missing signature', async () => {
    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{}',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('signature');
  });

  it('should return 400 for invalid signature', async () => {
    mockValidateStripeWebhook.mockRejectedValue(
      new Error('Webhook signature verification failed')
    );

    const request = createRequest('{}', 'invalid_signature');
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('signature');
  });

  it('should return 400 for empty body', async () => {
    const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'sig_123',
      },
      body: '',
    });

    mockValidateStripeWebhook.mockRejectedValue(new Error('Missing webhook body'));

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should extract orderId from metadata', async () => {
    const event = createStripeEvent('payment_intent.succeeded');
    (event.data!.object as Record<string, unknown>).metadata = {
      orderId: 'my_custom_order_id',
    };
    mockValidateStripeWebhook.mockResolvedValue(event);

    const request = createRequest(JSON.stringify(event));
    const response = await POST(request);
    const data = await response.json();

    expect(data.orderId).toBe('my_custom_order_id');
  });

  it('should handle missing orderId gracefully', async () => {
    const event = createStripeEvent('payment_intent.succeeded');
    (event.data!.object as Record<string, unknown>).metadata = {};
    mockValidateStripeWebhook.mockResolvedValue(event);

    const request = createRequest(JSON.stringify(event));
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.orderId).toBeUndefined();
  });
});
