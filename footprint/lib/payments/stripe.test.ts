/**
 * Stripe Payment Integration Tests
 *
 * TDD: These tests are written FIRST before implementation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store mock functions for access in tests
const mockCreate = vi.fn();
const mockConstructEvent = vi.fn();

// Mock Stripe module before imports
vi.mock('stripe', () => {
  return {
    default: class MockStripe {
      paymentIntents = {
        create: mockCreate,
      };
      webhooks = {
        constructEvent: mockConstructEvent,
      };
    },
  };
});

import {
  getStripeConfig,
  createWalletPaymentIntent,
  validateStripeWebhook,
  resetStripeClient,
  WalletPaymentParams,
} from './stripe';

describe('Stripe Payment Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    resetStripeClient();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ============================================================================
  // Configuration Tests
  // ============================================================================

  describe('getStripeConfig', () => {
    it('should return config when all environment variables are set', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';

      const config = getStripeConfig();

      expect(config).toEqual({
        secretKey: 'sk_test_123',
        publishableKey: 'pk_test_123',
        webhookSecret: 'whsec_test_123',
        isTestMode: true,
      });
    });

    it('should detect production mode from secret key prefix', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_live_123';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_live_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_123';

      const config = getStripeConfig();

      expect(config.isTestMode).toBe(false);
    });

    it('should throw error when STRIPE_SECRET_KEY is missing', () => {
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
      delete process.env.STRIPE_SECRET_KEY;

      expect(() => getStripeConfig()).toThrow('STRIPE_SECRET_KEY is not configured');
    });

    it('should throw error when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
      delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      expect(() => getStripeConfig()).toThrow(
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured'
      );
    });

    it('should throw error when STRIPE_WEBHOOK_SECRET is missing', () => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      delete process.env.STRIPE_WEBHOOK_SECRET;

      expect(() => getStripeConfig()).toThrow('STRIPE_WEBHOOK_SECRET is not configured');
    });
  });

  // ============================================================================
  // Payment Intent Creation Tests
  // ============================================================================

  describe('createWalletPaymentIntent', () => {
    beforeEach(() => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
    });

    it('should create payment intent with correct parameters', async () => {
      mockCreate.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        status: 'requires_payment_method',
      });

      const params: WalletPaymentParams = {
        orderId: 'order_123',
        amount: 15000, // 150.00 ILS in agorot
        currency: 'ils',
        customerEmail: 'test@example.com',
        description: 'Pop Art Print - A4',
      };

      const result = await createWalletPaymentIntent(params);

      expect(mockCreate).toHaveBeenCalledWith({
        amount: 15000,
        currency: 'ils',
        payment_method_types: ['card'],
        metadata: {
          orderId: 'order_123',
        },
        receipt_email: 'test@example.com',
        description: 'Pop Art Print - A4',
      });

      expect(result).toEqual({
        paymentIntentId: 'pi_test_123',
        clientSecret: 'pi_test_123_secret_abc',
      });
    });

    it('should handle USD currency', async () => {
      mockCreate.mockResolvedValue({
        id: 'pi_usd_123',
        client_secret: 'pi_usd_123_secret',
        status: 'requires_payment_method',
      });

      const params: WalletPaymentParams = {
        orderId: 'order_456',
        amount: 2999, // $29.99 in cents
        currency: 'usd',
        customerEmail: 'user@example.com',
      };

      await createWalletPaymentIntent(params);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 2999,
          currency: 'usd',
        })
      );
    });

    it('should throw error when Stripe API fails', async () => {
      mockCreate.mockRejectedValue(new Error('Stripe API error'));

      const params: WalletPaymentParams = {
        orderId: 'order_789',
        amount: 10000,
        currency: 'ils',
        customerEmail: 'test@example.com',
      };

      await expect(createWalletPaymentIntent(params)).rejects.toThrow(
        'Failed to create payment intent: Stripe API error'
      );
    });

    it('should throw error for invalid amount', async () => {
      const params: WalletPaymentParams = {
        orderId: 'order_123',
        amount: 0,
        currency: 'ils',
        customerEmail: 'test@example.com',
      };

      await expect(createWalletPaymentIntent(params)).rejects.toThrow(
        'Amount must be greater than 0'
      );
    });

    it('should throw error for negative amount', async () => {
      const params: WalletPaymentParams = {
        orderId: 'order_123',
        amount: -100,
        currency: 'ils',
        customerEmail: 'test@example.com',
      };

      await expect(createWalletPaymentIntent(params)).rejects.toThrow(
        'Amount must be greater than 0'
      );
    });

    it('should throw error for missing orderId', async () => {
      const params: WalletPaymentParams = {
        orderId: '',
        amount: 10000,
        currency: 'ils',
        customerEmail: 'test@example.com',
      };

      await expect(createWalletPaymentIntent(params)).rejects.toThrow(
        'Order ID is required'
      );
    });

    it('should handle payment intent without description', async () => {
      mockCreate.mockResolvedValue({
        id: 'pi_no_desc',
        client_secret: 'pi_no_desc_secret',
        status: 'requires_payment_method',
      });

      const params: WalletPaymentParams = {
        orderId: 'order_nodesc',
        amount: 5000,
        currency: 'ils',
        customerEmail: 'nodesc@example.com',
      };

      await createWalletPaymentIntent(params);

      expect(mockCreate).toHaveBeenCalledWith({
        amount: 5000,
        currency: 'ils',
        payment_method_types: ['card'],
        metadata: {
          orderId: 'order_nodesc',
        },
        receipt_email: 'nodesc@example.com',
      });
    });
  });

  // ============================================================================
  // Webhook Validation Tests
  // ============================================================================

  describe('validateStripeWebhook', () => {
    beforeEach(() => {
      process.env.STRIPE_SECRET_KEY = 'sk_test_123';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
    });

    it('should validate webhook and return event on success', async () => {
      const mockEvent = {
        id: 'evt_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            metadata: { orderId: 'order_123' },
          },
        },
      };
      mockConstructEvent.mockReturnValue(mockEvent);

      const body = JSON.stringify({ data: 'test' });
      const signature = 'test_signature';

      const result = await validateStripeWebhook(body, signature);

      expect(mockConstructEvent).toHaveBeenCalledWith(
        body,
        signature,
        'whsec_test_123'
      );
      expect(result).toEqual(mockEvent);
    });

    it('should throw error for invalid signature', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Webhook signature verification failed');
      });

      const body = JSON.stringify({ data: 'test' });
      const signature = 'invalid_signature';

      await expect(validateStripeWebhook(body, signature)).rejects.toThrow(
        'Webhook signature verification failed'
      );
    });

    it('should throw error when signature is missing', async () => {
      const body = JSON.stringify({ data: 'test' });

      await expect(validateStripeWebhook(body, '')).rejects.toThrow(
        'Missing Stripe webhook signature'
      );
    });

    it('should throw error when body is empty', async () => {
      await expect(validateStripeWebhook('', 'sig_123')).rejects.toThrow(
        'Missing webhook body'
      );
    });

    it('should handle various payment_intent events', async () => {
      const events = [
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'payment_intent.canceled',
      ];

      for (const eventType of events) {
        mockConstructEvent.mockReturnValue({
          id: `evt_${eventType}`,
          type: eventType,
          data: { object: { id: 'pi_123' } },
        });

        const result = await validateStripeWebhook('{}', 'sig');
        expect(result.type).toBe(eventType);
      }
    });
  });
});
