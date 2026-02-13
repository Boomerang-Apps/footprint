import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import {
  createPaymentLink,
  validateWebhook,
  getPayPlusConfig,
  type CreatePaymentParams,
} from './payplus';

describe('PayPlus Payment Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variables
    vi.stubEnv('PAYPLUS_API_KEY', 'test_api_key');
    vi.stubEnv('PAYPLUS_SECRET_KEY', 'test_secret_key');
    vi.stubEnv('PAYPLUS_PAYMENT_PAGE_UID', 'test_page_uid');
    vi.stubEnv('PAYPLUS_SANDBOX', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getPayPlusConfig', () => {
    it('should return config from environment variables', () => {
      const config = getPayPlusConfig();

      expect(config.apiKey).toBe('test_api_key');
      expect(config.secretKey).toBe('test_secret_key');
      expect(config.paymentPageUid).toBe('test_page_uid');
      expect(config.sandbox).toBe(true);
    });

    it('should throw error if API key is missing', () => {
      vi.stubEnv('PAYPLUS_API_KEY', '');

      expect(() => getPayPlusConfig()).toThrow('PAYPLUS_API_KEY');
    });

    it('should throw error if secret key is missing', () => {
      vi.stubEnv('PAYPLUS_SECRET_KEY', '');

      expect(() => getPayPlusConfig()).toThrow('PAYPLUS_SECRET_KEY');
    });

    it('should throw error if payment page UID is missing', () => {
      vi.stubEnv('PAYPLUS_PAYMENT_PAGE_UID', '');

      expect(() => getPayPlusConfig()).toThrow('PAYPLUS_PAYMENT_PAGE_UID');
    });

    it('should use sandbox URL when sandbox is true', () => {
      vi.stubEnv('PAYPLUS_SANDBOX', 'true');
      const config = getPayPlusConfig();

      expect(config.baseUrl).toBe('https://restapidev.payplus.co.il/api/v1.0');
    });

    it('should use production URL when sandbox is false', () => {
      vi.stubEnv('PAYPLUS_SANDBOX', 'false');
      const config = getPayPlusConfig();

      expect(config.baseUrl).toBe('https://restapi.payplus.co.il/api/v1.0');
    });
  });

  describe('createPaymentLink', () => {
    const validParams: CreatePaymentParams = {
      orderId: 'order_123',
      amount: 15800,
      customerEmail: 'test@example.com',
      customerName: 'Test User',
      successUrl: 'https://example.com/success',
      failureUrl: 'https://example.com/failure',
      callbackUrl: 'https://example.com/webhook',
    };

    it('should create payment link successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            status: 'success',
            code: 0,
            description: 'payment page link has been generated',
          },
          data: {
            page_request_uid: 'request_uid_123',
            payment_page_link: 'https://payments.payplus.co.il/abc123',
          },
        }),
      });

      const result = await createPaymentLink(validParams);

      expect(result.pageRequestUid).toBe('request_uid_123');
      expect(result.paymentUrl).toBe('https://payments.payplus.co.il/abc123');
    });

    it('should send correct request body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: { status: 'success', code: 0 },
          data: {
            page_request_uid: 'uid',
            payment_page_link: 'https://link',
          },
        }),
      });

      await createPaymentLink(validParams);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://restapidev.payplus.co.il/api/v1.0/PaymentPages/generateLink',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': 'test_api_key',
            'secret-key': 'test_secret_key',
          },
        })
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.payment_page_uid).toBe('test_page_uid');
      expect(callBody.charge_method).toBe(1);
      expect(callBody.amount).toBe(158); // Converted from agorot to ILS
      expect(callBody.currency_code).toBe('ILS');
      expect(callBody.customer.customer_name).toBe('Test User');
      expect(callBody.customer.email).toBe('test@example.com');
      expect(callBody.more_info).toBe('order_123');
      expect(callBody.refURL_success).toBe('https://example.com/success');
      expect(callBody.refURL_failure).toBe('https://example.com/failure');
      expect(callBody.refURL_callback).toBe('https://example.com/webhook');
    });

    it('should include customer phone if provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: { status: 'success', code: 0 },
          data: { page_request_uid: 'uid', payment_page_link: 'https://link' },
        }),
      });

      await createPaymentLink({
        ...validParams,
        customerPhone: '0501234567',
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.customer.phone).toBe('0501234567');
    });

    it('should throw error on API failure response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          results: {
            status: 'error',
            code: 100,
            description: 'Invalid request',
          },
        }),
      });

      await expect(createPaymentLink(validParams)).rejects.toThrow(
        'PayPlus API error'
      );
    });

    it('should throw error on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(createPaymentLink(validParams)).rejects.toThrow(
        'Network error'
      );
    });

    it('should throw error if response is missing payment link', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: { status: 'success', code: 0 },
          data: {
            page_request_uid: 'uid',
            // Missing payment_page_link
          },
        }),
      });

      await expect(createPaymentLink(validParams)).rejects.toThrow(
        'payment link'
      );
    });

    it('should handle API error with description', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            status: 'error',
            code: 500,
            description: 'Internal server error',
          },
        }),
      });

      await expect(createPaymentLink(validParams)).rejects.toThrow(
        'Internal server error'
      );
    });
  });

  describe('validateWebhook', () => {
    it('should return true for valid webhook signature', () => {
      const body = '{"transaction_uid":"123"}';
      const secretKey = 'test_secret';

      // Calculate expected hash
      const crypto = require('crypto');
      const expectedHash = crypto
        .createHmac('sha256', secretKey)
        .update(body)
        .digest('base64');

      const result = validateWebhook(body, expectedHash, secretKey);

      expect(result).toBe(true);
    });

    it('should return false for invalid webhook signature', () => {
      const body = '{"transaction_uid":"123"}';
      const invalidHash = 'invalid_hash_value';
      const secretKey = 'test_secret';

      const result = validateWebhook(body, invalidHash, secretKey);

      expect(result).toBe(false);
    });

    it('should return false for tampered body', () => {
      const originalBody = '{"transaction_uid":"123"}';
      const tamperedBody = '{"transaction_uid":"456"}';
      const secretKey = 'test_secret';

      const crypto = require('crypto');
      const hashForOriginal = crypto
        .createHmac('sha256', secretKey)
        .update(originalBody)
        .digest('base64');

      const result = validateWebhook(tamperedBody, hashForOriginal, secretKey);

      expect(result).toBe(false);
    });

    it('should handle empty body', () => {
      const body = '';
      const secretKey = 'test_secret';

      const crypto = require('crypto');
      const expectedHash = crypto
        .createHmac('sha256', secretKey)
        .update(body)
        .digest('base64');

      const result = validateWebhook(body, expectedHash, secretKey);

      expect(result).toBe(true);
    });
  });
});
