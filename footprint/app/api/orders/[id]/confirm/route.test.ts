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
const mockSingle = vi.fn();

vi.mock('@/lib/email/resend', () => ({
  sendOrderConfirmationEmail: (...args: unknown[]) => mockSendOrderConfirmationEmail(...args),
  generateWhatsAppShareUrl: (...args: unknown[]) => mockGenerateWhatsAppShareUrl(...args),
}));

// Mock rate limiting to skip Upstash Redis in tests
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

// Mock order matching actual Supabase schema
const mockOrder = {
  id: 'order_123',
  user_id: 'user123',
  guest_email: null,
  order_number: 'FP-20231223-ABC123',
  status: 'paid',
  subtotal: 15800,
  shipping_cost: 2500,
  total: 18300,
  shipping_address: {
    name: 'John Doe',
    email: 'customer@example.com',
    phone: '050-1234567',
    street: '123 Main St',
    city: 'Tel Aviv',
    postalCode: '12345',
  },
  is_gift: false,
  gift_message: null,
  created_at: '2026-02-08T11:10:00Z',
  order_items: [
    {
      original_image_url: 'https://example.com/photo.jpg',
      transformed_image_url: 'https://example.com/photo-art.jpg',
      style: 'Pop Art',
      size: 'A4',
      paper_type: 'Glossy',
      frame_type: 'Black',
      quantity: 1,
      base_price: 15800,
      item_total: 15800,
    },
  ],
};

const mockSupabaseClient = {
  auth: {
    getUser: () => mockGetUser(),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => mockSingle(),
        eq: () => ({
          single: () => mockSingle(),
        }),
      }),
    }),
  }),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabaseClient,
  createAdminClient: () => mockSupabaseClient,
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

    // Default: order found
    mockSingle.mockResolvedValue({
      data: mockOrder,
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

    it('should not require authentication (internal endpoint)', async () => {
      // Even with no auth, POST should work (called internally from webhook)
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'POST',
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order_123' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
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
          subtotal: 158,
          shipping: 25,
          total: 183,
          isGift: false,
        })
      );
    });

    it('should convert agorot to shekel for email', async () => {
      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'POST',
      });

      await POST(request, { params: Promise.resolve({ id: 'order_123' }) });

      const call = mockSendOrderConfirmationEmail.mock.calls[0][0];
      expect(call.total).toBe(183);
      expect(call.subtotal).toBe(158);
      expect(call.shipping).toBe(25);
      expect(call.items[0].price).toBe(158);
    });

    it('should map order_items to email format', async () => {
      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'POST',
      });

      await POST(request, { params: Promise.resolve({ id: 'order_123' }) });

      const call = mockSendOrderConfirmationEmail.mock.calls[0][0];
      expect(call.items).toHaveLength(1);
      expect(call.items[0]).toEqual(expect.objectContaining({
        name: 'Pop Art - A4',
        quantity: 1,
        style: 'Pop Art',
        size: 'A4',
        paper: 'Glossy',
        frame: 'Black',
        imageUrl: 'https://example.com/photo-art.jpg',
      }));
    });

    it('should return 404 when order not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });

      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'POST',
      });

      const response = await POST(request, { params: Promise.resolve({ id: 'order_123' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
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

    it('should return order summary with prices in shekel', async () => {
      const request = new Request('http://localhost/api/orders/order_123/confirm', {
        method: 'GET',
      });

      const response = await GET(request, { params: Promise.resolve({ id: 'order_123' }) });
      const data = await response.json();

      expect(data.total).toBe(183);
      expect(data.subtotal).toBe(158);
      expect(data.shipping).toBe(25);
      expect(data.items).toHaveLength(1);
      expect(data.shippingAddress).toHaveProperty('city', 'Tel Aviv');
    });
  });
});
