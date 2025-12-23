import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from './route';

// Mock dependencies
const mockConstructWebhookEvent = vi.fn();

vi.mock('@/lib/payments/stripe', () => ({
  constructWebhookEvent: (...args: unknown[]) => mockConstructWebhookEvent(...args),
}));

// Mock environment variables
const mockEnv = {
  STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
};

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.entries(mockEnv).forEach(([key, value]) => {
      vi.stubEnv(key, value);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Signature verification', () => {
    it('should return 400 for missing stripe-signature header', async () => {
      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        body: '{"type": "test"}',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('stripe-signature');
    });

    it('should return 400 for invalid signature', async () => {
      mockConstructWebhookEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 'invalid_sig' },
        body: '{"type": "test"}',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid signature');
    });

    it('should verify signature with correct webhook secret', async () => {
      mockConstructWebhookEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_123', metadata: {} } },
      });

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid_sig' },
        body: '{"type": "test"}',
      });

      await POST(request);

      expect(mockConstructWebhookEvent).toHaveBeenCalledWith(
        '{"type": "test"}',
        'valid_sig',
        'whsec_test_123'
      );
    });
  });

  describe('Event handling', () => {
    it('should process checkout.session.completed event', async () => {
      mockConstructWebhookEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            metadata: { orderId: 'order_123' },
          },
        },
      });

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid_sig' },
        body: '{"type": "checkout.session.completed"}',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('should handle payment_intent.payment_failed event', async () => {
      mockConstructWebhookEvent.mockReturnValue({
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_test_123',
            last_payment_error: { message: 'Card declined' },
          },
        },
      });

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid_sig' },
        body: '{"type": "payment_intent.payment_failed"}',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('should return 200 for unhandled event types', async () => {
      mockConstructWebhookEvent.mockReturnValue({
        type: 'customer.created',
        data: { object: { id: 'cus_test_123' } },
      });

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid_sig' },
        body: '{"type": "customer.created"}',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });

    it('should handle session without orderId in metadata', async () => {
      mockConstructWebhookEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            metadata: {},
          },
        },
      });

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid_sig' },
        body: '{"type": "checkout.session.completed"}',
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Response format', () => {
    it('should return received: true on success', async () => {
      mockConstructWebhookEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            metadata: { orderId: 'order_123' },
          },
        },
      });

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid_sig' },
        body: '{"type": "test"}',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data).toEqual({ received: true });
    });
  });

  describe('Environment validation', () => {
    it('should return 500 when webhook secret is missing', async () => {
      vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');

      const request = new Request('http://localhost/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'stripe-signature': 'valid_sig' },
        body: '{"type": "test"}',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Webhook secret');
    });
  });
});
