import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Stripe before imports
const mockSessionsCreate = vi.fn();
const mockSessionsRetrieve = vi.fn();
const mockConstructEvent = vi.fn();

vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      checkout = {
        sessions: {
          create: mockSessionsCreate,
          retrieve: mockSessionsRetrieve,
        },
      };
      webhooks = {
        constructEvent: mockConstructEvent,
      };
      constructor() {}
    },
  };
});

// Import after mocking
import {
  createCheckoutSession,
  retrieveSession,
  constructWebhookEvent,
  CheckoutSessionParams,
} from './stripe';

describe('lib/payments/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('createCheckoutSession', () => {
    const defaultParams: CheckoutSessionParams = {
      orderId: 'order_123',
      amount: 15800, // 158.00 ILS in agorot
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    };

    it('should create checkout session and return sessionId and url', async () => {
      mockSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      const result = await createCheckoutSession(defaultParams);

      expect(result.sessionId).toBe('cs_test_123');
      expect(result.url).toBe('https://checkout.stripe.com/test');
    });

    it('should call Stripe with correct parameters', async () => {
      mockSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      await createCheckoutSession(defaultParams);

      expect(mockSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ['card'],
          mode: 'payment',
          success_url: 'https://example.com/success',
          cancel_url: 'https://example.com/cancel',
        })
      );
    });

    it('should include orderId in metadata', async () => {
      mockSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      await createCheckoutSession(defaultParams);

      expect(mockSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            orderId: 'order_123',
          }),
        })
      );
    });

    it('should use ILS currency', async () => {
      mockSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      await createCheckoutSession(defaultParams);

      expect(mockSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price_data: expect.objectContaining({
                currency: 'ils',
                unit_amount: 15800,
              }),
            }),
          ]),
        })
      );
    });

    it('should include customer email when provided', async () => {
      mockSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      await createCheckoutSession({
        ...defaultParams,
        customerEmail: 'test@example.com',
      });

      expect(mockSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_email: 'test@example.com',
        })
      );
    });

    it('should handle missing email gracefully', async () => {
      mockSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      const result = await createCheckoutSession(defaultParams);

      expect(result.sessionId).toBeDefined();
      expect(result.url).toBeDefined();
    });

    it('should include additional metadata when provided', async () => {
      mockSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      await createCheckoutSession({
        ...defaultParams,
        metadata: { customField: 'value' },
      });

      expect(mockSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            orderId: 'order_123',
            customField: 'value',
          }),
        })
      );
    });

    it('should throw error when session URL is missing', async () => {
      mockSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: null,
      });

      await expect(createCheckoutSession(defaultParams)).rejects.toThrow(
        'Failed to create checkout session URL'
      );
    });

    it('should throw error when Stripe API fails', async () => {
      mockSessionsCreate.mockRejectedValue(new Error('Stripe API error'));

      await expect(createCheckoutSession(defaultParams)).rejects.toThrow(
        'Stripe API error'
      );
    });

    it('should include product name and description', async () => {
      mockSessionsCreate.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      });

      await createCheckoutSession(defaultParams);

      expect(mockSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: expect.arrayContaining([
            expect.objectContaining({
              price_data: expect.objectContaining({
                product_data: expect.objectContaining({
                  name: expect.any(String),
                  description: expect.any(String),
                }),
              }),
            }),
          ]),
        })
      );
    });
  });

  describe('retrieveSession', () => {
    it('should retrieve session by ID', async () => {
      const mockSession = {
        id: 'cs_test_123',
        payment_status: 'paid',
        metadata: { orderId: 'order_123' },
      };
      mockSessionsRetrieve.mockResolvedValue(mockSession);

      const result = await retrieveSession('cs_test_123');

      expect(result).toEqual(mockSession);
      expect(mockSessionsRetrieve).toHaveBeenCalledWith('cs_test_123');
    });

    it('should throw error when session not found', async () => {
      mockSessionsRetrieve.mockRejectedValue(new Error('No such session'));

      await expect(retrieveSession('invalid_session')).rejects.toThrow(
        'No such session'
      );
    });
  });

  describe('constructWebhookEvent', () => {
    it('should construct event from valid payload and signature', () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_123' } },
      };
      mockConstructEvent.mockReturnValue(mockEvent);

      const result = constructWebhookEvent(
        '{"test": "payload"}',
        'sig_123',
        'whsec_test'
      );

      expect(result).toEqual(mockEvent);
      expect(mockConstructEvent).toHaveBeenCalledWith(
        '{"test": "payload"}',
        'sig_123',
        'whsec_test'
      );
    });

    it('should throw error for invalid signature', () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      expect(() =>
        constructWebhookEvent('payload', 'invalid_sig', 'whsec_test')
      ).toThrow('Invalid signature');
    });

    it('should accept Buffer payload', () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_123' } },
      };
      mockConstructEvent.mockReturnValue(mockEvent);

      const bufferPayload = Buffer.from('{"test": "payload"}');
      const result = constructWebhookEvent(bufferPayload, 'sig_123', 'whsec_test');

      expect(result).toEqual(mockEvent);
    });
  });

  describe('Environment validation', () => {
    it('should throw error when STRIPE_SECRET_KEY is missing', async () => {
      vi.stubEnv('STRIPE_SECRET_KEY', '');

      // The error is thrown when a function tries to use the Stripe client
      await expect(
        createCheckoutSession({
          orderId: 'order_123',
          amount: 15800,
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        })
      ).rejects.toThrow('STRIPE_SECRET_KEY');
    });
  });
});
