/**
 * Admin Order Tracking API Tests
 *
 * TDD: Tests written FIRST before implementation.
 * Endpoint: PATCH /api/admin/orders/[id]/tracking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Supabase client - must be defined inline
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn(),
        update: vi.fn(),
      })),
    })
  ),
}));

// Mock rate limiting to skip Upstash Redis in tests
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
}));

// Mock email sending
vi.mock('@/lib/email/resend', () => ({
  sendTrackingNotificationEmail: vi.fn(),
}));

// Mock tracking validation (use actual implementation)
vi.mock('@/lib/orders/tracking', () => ({
  isValidCarrier: vi.fn((code: string) =>
    ['israel_post', 'dhl', 'fedex', 'ups', 'other'].includes(code)
  ),
  validateTrackingNumber: vi.fn((tracking: string, carrier: string) => {
    if (!tracking) return { valid: false, error: 'Tracking number is required' };
    if (carrier === 'israel_post' && !/^(RR|RL|EA|EE)\d{9}IL$/.test(tracking.toUpperCase())) {
      return { valid: false, error: 'Invalid Israel Post tracking format' };
    }
    return { valid: true };
  }),
  createTrackingInfo: vi.fn((tracking: string, carrier: string, userId: string, note?: string) => ({
    trackingNumber: tracking,
    carrier,
    trackingUrl: carrier === 'other' ? null : `https://track.example.com/${tracking}`,
    addedBy: userId,
    addedAt: new Date(),
    note,
  })),
  generateTrackingUrl: vi.fn((tracking: string, carrier: string) =>
    carrier === 'other' ? null : `https://track.example.com/${tracking}`
  ),
  CARRIERS: {
    israel_post: { name: 'Israel Post', nameHe: 'דואר ישראל' },
    dhl: { name: 'DHL', nameHe: 'DHL' },
    fedex: { name: 'FedEx', nameHe: 'FedEx' },
    ups: { name: 'UPS', nameHe: 'UPS' },
    other: { name: 'Other', nameHe: 'אחר' },
  },
}));

// Import after mocks
import { PATCH } from './route';
import { createClient } from '@/lib/supabase/server';
import { sendTrackingNotificationEmail } from '@/lib/email/resend';

// Cast to mocked types
const mockCreateClient = createClient as ReturnType<typeof vi.fn>;
const mockSendTrackingEmail = sendTrackingNotificationEmail as ReturnType<typeof vi.fn>;

describe('PATCH /api/admin/orders/[id]/tracking', () => {
  // Helper to set up the mock client
  function setupMockClient(options: {
    user?: {
      id: string;
      email: string;
      user_metadata: { role: string };
    } | null;
    authError?: { message: string } | null;
    order?: {
      id: string;
      status: string;
      customer_email: string;
      customer_name: string;
      tracking_number?: string;
    } | null;
    fetchError?: { message: string } | null;
    updateResult?: {
      id: string;
      tracking_number: string;
      carrier: string;
      tracking_url: string;
      updated_at: string;
    } | null;
    updateError?: { message: string } | null;
  }) {
    const mockGetUser = vi.fn().mockResolvedValue({
      data: { user: options.user ?? null },
      error: options.authError ?? null,
    });

    const mockSingle = vi.fn().mockResolvedValue({
      data: options.order ?? null,
      error: options.fetchError ?? null,
    });

    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });

    const mockUpdateSingle = vi.fn().mockResolvedValue({
      data: options.updateResult ?? null,
      error: options.updateError ?? null,
    });
    const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle });
    const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

    const mockFrom = vi.fn().mockReturnValue({
      select: mockSelect,
      update: mockUpdate,
    });

    mockCreateClient.mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    });

    return { mockGetUser, mockSelect, mockUpdate };
  }

  beforeEach(() => {
    vi.clearAllMocks();

    // Default setup: authenticated admin user with existing order
    setupMockClient({
      user: {
        id: 'admin_123',
        email: 'admin@footprint.co.il',
        user_metadata: { role: 'admin' },
      },
      order: {
        id: 'order_123',
        status: 'printing',
        customer_email: 'customer@example.com',
        customer_name: 'Test Customer',
      },
      updateResult: {
        id: 'order_123',
        tracking_number: 'RR123456789IL',
        carrier: 'israel_post',
        tracking_url: 'https://israelpost.co.il/itemtrace?itemcode=RR123456789IL',
        updated_at: new Date().toISOString(),
      },
    });

    // Default: email sends successfully
    mockSendTrackingEmail.mockResolvedValue({
      success: true,
      emailId: 'email_123',
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ============================================================================
  // Authentication Tests
  // ============================================================================

  describe('Authentication', () => {
    it('should return 401 for unauthenticated requests', async () => {
      setupMockClient({
        user: null,
        authError: { message: 'Not authenticated' },
      });

      const request = createRequest({ trackingNumber: 'RR123456789IL', carrier: 'israel_post' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toContain('Unauthorized');
    });

    it('should return 403 for non-admin users', async () => {
      setupMockClient({
        user: {
          id: 'user_123',
          email: 'user@example.com',
          user_metadata: { role: 'customer' },
        },
      });

      const request = createRequest({ trackingNumber: 'RR123456789IL', carrier: 'israel_post' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Admin access required');
    });

    it('should allow admin users to proceed', async () => {
      const request = createRequest({ trackingNumber: 'RR123456789IL', carrier: 'israel_post' });
      const response = await PATCH(request, { params: { id: 'order_123' } });

      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // Validation Tests
  // ============================================================================

  describe('Request Validation', () => {
    it('should return 400 for missing trackingNumber', async () => {
      const request = createRequest({ carrier: 'israel_post' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('trackingNumber');
    });

    it('should return 400 for missing carrier', async () => {
      const request = createRequest({ trackingNumber: 'RR123456789IL' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('carrier');
    });

    it('should return 400 for invalid carrier code', async () => {
      const request = createRequest({ trackingNumber: 'RR123456789IL', carrier: 'invalid' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid carrier');
    });

    it('should return 400 for invalid tracking number format', async () => {
      const request = createRequest({ trackingNumber: 'INVALID', carrier: 'israel_post' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid');
    });

    it('should return 404 for non-existent order', async () => {
      setupMockClient({
        user: {
          id: 'admin_123',
          email: 'admin@footprint.co.il',
          user_metadata: { role: 'admin' },
        },
        order: null,
        fetchError: { message: 'Not found' },
      });

      const request = createRequest({ trackingNumber: 'RR123456789IL', carrier: 'israel_post' });
      const response = await PATCH(request, { params: { id: 'nonexistent' } });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('Order not found');
    });
  });

  // ============================================================================
  // Success Response Tests
  // ============================================================================

  describe('Successful Tracking Update', () => {
    it('should return updated order with tracking info', async () => {
      const request = createRequest({ trackingNumber: 'RR123456789IL', carrier: 'israel_post' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.order.id).toBe('order_123');
      expect(body.order.trackingNumber).toBe('RR123456789IL');
      expect(body.order.carrier).toBe('israel_post');
    });

    it('should include tracking URL in response', async () => {
      const request = createRequest({ trackingNumber: 'RR123456789IL', carrier: 'israel_post' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(body.order.trackingUrl).toContain('israelpost');
    });

    it('should include notification status in response', async () => {
      const request = createRequest({ trackingNumber: 'RR123456789IL', carrier: 'israel_post' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(body.notification).toBeDefined();
      expect(body.notification.sent).toBe(true);
    });

    it('should accept optional note', async () => {
      const request = createRequest({
        trackingNumber: 'RR123456789IL',
        carrier: 'israel_post',
        note: 'Sent via express',
      });
      const response = await PATCH(request, { params: { id: 'order_123' } });

      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // Email Notification Tests
  // ============================================================================

  describe('Customer Notification', () => {
    it('should send tracking email on successful update', async () => {
      const request = createRequest({ trackingNumber: 'RR123456789IL', carrier: 'israel_post' });
      await PATCH(request, { params: { id: 'order_123' } });

      expect(mockSendTrackingEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          customerName: 'Test Customer',
          orderId: 'order_123',
          trackingNumber: 'RR123456789IL',
          carrier: 'israel_post',
        })
      );
    });

    it('should still succeed even if email fails', async () => {
      mockSendTrackingEmail.mockResolvedValue({
        success: false,
        error: 'Email service unavailable',
      });

      const request = createRequest({ trackingNumber: 'RR123456789IL', carrier: 'israel_post' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.notification.sent).toBe(false);
    });
  });

  // ============================================================================
  // Database Update Tests
  // ============================================================================

  describe('Database Operations', () => {
    it('should return 500 on database update error', async () => {
      setupMockClient({
        user: {
          id: 'admin_123',
          email: 'admin@footprint.co.il',
          user_metadata: { role: 'admin' },
        },
        order: {
          id: 'order_123',
          status: 'printing',
          customer_email: 'customer@example.com',
          customer_name: 'Test Customer',
        },
        updateResult: null,
        updateError: { message: 'Database error' },
      });

      const request = createRequest({ trackingNumber: 'RR123456789IL', carrier: 'israel_post' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('Failed to update');
    });
  });
});

// ============================================================================
// Helper Functions
// ============================================================================

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost/api/admin/orders/order_123/tracking', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
