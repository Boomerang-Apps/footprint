import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import {
  sendOrderConfirmationEmail,
  sendNewOrderNotificationEmail,
  generateWhatsAppShareUrl,
  generateOrderNumber,
  getResendConfig,
  type OrderConfirmationParams,
  type NewOrderNotificationParams,
} from './resend';

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('RESEND_API_KEY', 're_test_123');
    vi.stubEnv('EMAIL_FROM', 'orders@footprint.co.il');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getResendConfig', () => {
    it('should return config from environment variables', () => {
      const config = getResendConfig();

      expect(config.apiKey).toBe('re_test_123');
      expect(config.fromEmail).toBe('orders@footprint.co.il');
    });

    it('should throw error if API key is missing', () => {
      vi.stubEnv('RESEND_API_KEY', '');

      expect(() => getResendConfig()).toThrow('RESEND_API_KEY');
    });

    it('should use default from email if not provided', () => {
      vi.stubEnv('EMAIL_FROM', '');
      const config = getResendConfig();

      expect(config.fromEmail).toBe('noreply@updates.footprint.co.il');
    });
  });

  describe('generateOrderNumber', () => {
    it('should generate order number with FP prefix', () => {
      const orderNumber = generateOrderNumber();

      expect(orderNumber).toMatch(/^FP-\d{8}-[A-Z0-9]{6}$/);
    });

    it('should generate unique order numbers', () => {
      const orderNumber1 = generateOrderNumber();
      const orderNumber2 = generateOrderNumber();

      expect(orderNumber1).not.toBe(orderNumber2);
    });

    it('should include date component', () => {
      const orderNumber = generateOrderNumber();
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

      expect(orderNumber).toContain(today);
    });
  });

  describe('sendOrderConfirmationEmail', () => {
    const validParams: OrderConfirmationParams = {
      to: 'customer@example.com',
      customerName: 'John Doe',
      orderNumber: 'FP-20231223-ABC123',
      items: [
        {
          name: 'Pop Art Print - A4',
          quantity: 1,
          price: 158,
        },
      ],
      subtotal: 158,
      shipping: 25,
      total: 183,
      shippingAddress: {
        street: '123 Main St',
        city: 'Tel Aviv',
        postalCode: '12345',
        country: 'Israel',
      },
    };

    it('should send email successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      });

      const result = await sendOrderConfirmationEmail(validParams);

      expect(result.success).toBe(true);
      expect(result.emailId).toBe('email_123');
    });

    it('should call Resend API with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      });

      await sendOrderConfirmationEmail(validParams);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.resend.com/emails',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer re_test_123',
          },
        })
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.from).toBe('orders@footprint.co.il');
      expect(callBody.to).toBe('customer@example.com');
      expect(callBody.subject).toContain('FP-20231223-ABC123');
    });

    it('should include order details in email body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      });

      await sendOrderConfirmationEmail(validParams);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.html).toContain('John Doe');
      expect(callBody.html).toContain('FP-20231223-ABC123');
      expect(callBody.html).toContain('Pop Art Print - A4');
      expect(callBody.html).toContain('183'); // Total
      expect(callBody.html).toContain('Tel Aviv');
    });

    it('should handle API error gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Invalid email address' }),
      });

      const result = await sendOrderConfirmationEmail(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email');
    });

    it('should handle network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await sendOrderConfirmationEmail(validParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should handle multiple items', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      });

      const multiItemParams: OrderConfirmationParams = {
        ...validParams,
        items: [
          { name: 'Pop Art Print - A4', quantity: 1, price: 158 },
          { name: 'Watercolor Print - A3', quantity: 2, price: 220 },
        ],
        subtotal: 598,
        total: 623,
      };

      await sendOrderConfirmationEmail(multiItemParams);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.html).toContain('Pop Art Print - A4');
      expect(callBody.html).toContain('Watercolor Print - A3');
    });
  });

  describe('sendNewOrderNotificationEmail', () => {
    const validNotificationParams: NewOrderNotificationParams = {
      orderNumber: 'FP-20231223-ABC123',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      items: [
        {
          name: 'Pop Art Print - A4',
          quantity: 1,
          price: 158,
          imageUrl: 'https://cdn.footprint.co.il/transformed/abc123.jpg',
          style: 'Pop Art',
          size: 'A4',
          paper: 'Glossy',
          frame: 'Black',
        },
      ],
      total: 183,
      shippingAddress: {
        street: '123 Main St',
        city: 'Tel Aviv',
        postalCode: '12345',
        country: 'Israel',
      },
      isGift: false,
    };

    it('should send notification to orders@footprint.co.il', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_notify_123' }),
      });

      const result = await sendNewOrderNotificationEmail(validNotificationParams);

      expect(result.success).toBe(true);
      expect(result.emailId).toBe('email_notify_123');

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.to).toBe('orders@footprint.co.il');
    });

    it('should include image URL in HTML body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      });

      await sendNewOrderNotificationEmail(validNotificationParams);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.html).toContain('https://cdn.footprint.co.il/transformed/abc123.jpg');
      expect(callBody.html).toContain('<img');
    });

    it('should include order details in email', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      });

      await sendNewOrderNotificationEmail(validNotificationParams);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.html).toContain('FP-20231223-ABC123');
      expect(callBody.html).toContain('John Doe');
      expect(callBody.html).toContain('john@example.com');
      expect(callBody.html).toContain('183.00');
      expect(callBody.html).toContain('Tel Aviv');
    });

    it('should include Hebrew subject with order number and customer name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      });

      await sendNewOrderNotificationEmail(validNotificationParams);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.subject).toContain('הזמנה חדשה!');
      expect(callBody.subject).toContain('FP-20231223-ABC123');
      expect(callBody.subject).toContain('John Doe');
    });

    it('should include item customization details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      });

      await sendNewOrderNotificationEmail(validNotificationParams);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.html).toContain('Pop Art');
      expect(callBody.html).toContain('A4');
      expect(callBody.html).toContain('Glossy');
      expect(callBody.html).toContain('Black');
    });

    it('should show gift info when isGift is true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'email_123' }),
      });

      const giftParams: NewOrderNotificationParams = {
        ...validNotificationParams,
        isGift: true,
        giftMessage: 'Happy birthday!',
      };

      await sendNewOrderNotificationEmail(giftParams);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.html).toContain('הזמנת מתנה');
      expect(callBody.html).toContain('Happy birthday!');
    });

    it('should handle API error gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      });

      const result = await sendNewOrderNotificationEmail(validNotificationParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Internal server error');
    });

    it('should handle network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await sendNewOrderNotificationEmail(validNotificationParams);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection refused');
    });
  });

  describe('generateWhatsAppShareUrl', () => {
    it('should generate valid WhatsApp URL', () => {
      const url = generateWhatsAppShareUrl(
        'FP-20231223-ABC123',
        'Check out my custom art print!'
      );

      expect(url).toContain('https://wa.me/');
      expect(url).toContain('text=');
    });

    it('should encode message properly', () => {
      const url = generateWhatsAppShareUrl(
        'FP-20231223-ABC123',
        'My order: FP-20231223-ABC123'
      );

      // URL should be encoded
      expect(url).not.toContain(' ');
      expect(url).toContain('My%20order');
    });

    it('should include order number in message', () => {
      const url = generateWhatsAppShareUrl('FP-20231223-ABC123');

      expect(decodeURIComponent(url)).toContain('FP-20231223-ABC123');
    });

    it('should use default message if not provided', () => {
      const url = generateWhatsAppShareUrl('FP-20231223-ABC123');

      const decodedUrl = decodeURIComponent(url);
      expect(decodedUrl).toContain('Footprint');
      expect(decodedUrl).toContain('FP-20231223-ABC123');
    });

    it('should allow sending to specific phone number', () => {
      const url = generateWhatsAppShareUrl(
        'FP-20231223-ABC123',
        'Check out my order!',
        '+972501234567'
      );

      expect(url).toContain('972501234567');
    });
  });
});
