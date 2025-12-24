import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST, GET } from './route';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => undefined,
    set: () => {},
  }),
}));

// Mock dependencies
const mockSendOrderConfirmationEmail = vi.fn();
const mockGenerateWhatsAppShareUrl = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/email/resend', () => ({
  sendOrderConfirmationEmail: (...args: unknown[]) => mockSendOrderConfirmationEmail(...args),
  generateWhatsAppShareUrl: (...args: unknown[]) => mockGenerateWhatsAppShareUrl(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: () => mockGetUser(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'order_123',
              user_id: 'user123',
              order_number: 'FP-20231223-ABC123',
              status: 'paid',
              items: [{ name: 'Pop Art Print - A4', quantity: 1, price: 158 }],
              subtotal: 158,
              shipping: 25,
              total: 183,
              customer_name: 'John Doe',
              customer_email: 'customer@example.com',
              shipping_address: {
                street: '123 Main St',
                city: 'Tel Aviv',
                postalCode: '12345',
                country: 'Israel',
              },
            },
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

// Mock environment variables
const mockEnv = {
  RESEND_API_KEY: 're_test_123',
  EMAIL_FROM: 'orders@footprint.co.il',
};

describe('Order Confirmation API', () => {
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

    // Default mock returns
    mockSendOrderConfirmationEmail.mockResolvedValue({
      success: true,
      emailId: 'email_123',
    });

    mockGenerateWhatsAppShareUrl.mockReturnValue(
      'https://wa.me/?text=My%20order%20FP-20231223-ABC123'
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('POST /api/orders/[id]/confirm', () => {
    it('should send confirmation email and return success', async () => {
      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'POST',
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order_123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.emailId).toBe('email_123');
    });

    it('should return 401 for unauthenticated users', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'POST',
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order_123' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should call sendOrderConfirmationEmail with correct params', async () => {
      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'POST',
      });

      await POST(request, { params: Promise.resolve({ id: 'order_123' }) });

      expect(mockSendOrderConfirmationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          customerName: 'John Doe',
          orderNumber: 'FP-20231223-ABC123',
        })
      );
    });

    it('should return 500 when email fails', async () => {
      mockSendOrderConfirmationEmail.mockResolvedValue({
        success: false,
        error: 'Email service error',
      });

      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'POST',
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order_123' }) });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('email');
    });
  });

  describe('GET /api/orders/[id]/confirm', () => {
    it('should return order confirmation details', async () => {
      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({ id: 'order_123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orderNumber).toBe('FP-20231223-ABC123');
      expect(data.whatsappUrl).toContain('wa.me');
    });

    it('should return 401 for unauthenticated users', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({ id: 'order_123' }) });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should include WhatsApp share URL', async () => {
      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({ id: 'order_123' }) });
      const data = await response.json();

      expect(mockGenerateWhatsAppShareUrl).toHaveBeenCalledWith('FP-20231223-ABC123');
      expect(data.whatsappUrl).toBe('https://wa.me/?text=My%20order%20FP-20231223-ABC123');
    });

    it('should return order summary', async () => {
      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({ id: 'order_123' }) });
      const data = await response.json();

      expect(data.total).toBe(183);
      expect(data.items).toHaveLength(1);
      expect(data.shippingAddress).toHaveProperty('city', 'Tel Aviv');
    });
  });
});
