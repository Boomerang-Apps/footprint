/**
 * Admin Order Status Update API Tests
 *
 * TDD: Tests written FIRST before implementation.
 * Endpoint: PATCH /api/admin/orders/[id]/status
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

// Mock email sending - must be defined inline
vi.mock('@/lib/email/resend', () => ({
  sendStatusUpdateEmail: vi.fn(),
}));

// Mock status validation
vi.mock('@/lib/orders/status', () => ({
  isValidStatusTransition: vi.fn((from: string, to: string) => {
    const validTransitions: Record<string, string[]> = {
      pending: ['paid', 'cancelled'],
      paid: ['processing', 'cancelled'],
      processing: ['printing', 'cancelled'],
      printing: ['shipped'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    };
    return validTransitions[from]?.includes(to) ?? false;
  }),
  getStatusLabel: vi.fn((status: string) => {
    const labels: Record<string, string> = {
      shipped: 'נשלח',
      delivered: 'נמסר',
    };
    return labels[status] || status;
  }),
  createStatusHistoryEntry: vi.fn((status: string, changedBy: string, note?: string) => ({
    status,
    timestamp: new Date(),
    changedBy,
    note,
  })),
}));

// Import after mocks
import { PATCH } from './route';
import { createClient } from '@/lib/supabase/server';
import { sendStatusUpdateEmail } from '@/lib/email/resend';

// Cast to mocked types
const mockCreateClient = createClient as ReturnType<typeof vi.fn>;
const mockSendStatusUpdateEmail = sendStatusUpdateEmail as ReturnType<typeof vi.fn>;

describe('PATCH /api/admin/orders/[id]/status', () => {
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
      status_history: unknown[];
    } | null;
    fetchError?: { message: string } | null;
    updateResult?: {
      id: string;
      status: string;
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
        status: 'processing',
        customer_email: 'customer@example.com',
        customer_name: 'Test Customer',
        status_history: [],
      },
      updateResult: {
        id: 'order_123',
        status: 'printing',
        updated_at: new Date().toISOString(),
      },
    });

    // Default: email sends successfully
    mockSendStatusUpdateEmail.mockResolvedValue({
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

      const request = createRequest({ status: 'shipped' });
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

      const request = createRequest({ status: 'shipped' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toContain('Admin access required');
    });

    it('should allow admin users to proceed', async () => {
      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: { id: 'order_123' } });

      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // Validation Tests
  // ============================================================================

  describe('Request Validation', () => {
    it('should return 400 for missing status field', async () => {
      const request = createRequest({});
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('status');
    });

    it('should return 400 for invalid JSON body', async () => {
      const request = new NextRequest('http://localhost/api/admin/orders/order_123/status', {
        method: 'PATCH',
        body: 'not-json',
      });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid JSON');
    });

    it('should return 400 for invalid status value', async () => {
      const request = createRequest({ status: 'invalid_status' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid status');
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

      const request = createRequest({ status: 'shipped' });
      const response = await PATCH(request, { params: { id: 'nonexistent' } });
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('Order not found');
    });
  });

  // ============================================================================
  // Status Transition Tests
  // ============================================================================

  describe('Status Transition Validation', () => {
    it('should return 400 for invalid transition processing -> shipped', async () => {
      const request = createRequest({ status: 'shipped' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid status transition');
    });

    it('should allow valid transition processing -> printing', async () => {
      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: { id: 'order_123' } });

      expect(response.status).toBe(200);
    });

    it('should return 400 for transition from terminal state', async () => {
      setupMockClient({
        user: {
          id: 'admin_123',
          email: 'admin@footprint.co.il',
          user_metadata: { role: 'admin' },
        },
        order: {
          id: 'order_123',
          status: 'delivered',
          customer_email: 'customer@example.com',
          customer_name: 'Test Customer',
          status_history: [],
        },
      });

      const request = createRequest({ status: 'shipped' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('Invalid status transition');
    });
  });

  // ============================================================================
  // Success Response Tests
  // ============================================================================

  describe('Successful Update', () => {
    it('should return updated order with new status', async () => {
      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.order.id).toBe('order_123');
      expect(body.order.status).toBe('printing');
      expect(body.order.updatedAt).toBeDefined();
    });

    it('should include notification status in response', async () => {
      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(body.notification).toBeDefined();
      expect(body.notification.sent).toBe(true);
    });

    it('should accept optional note in request', async () => {
      const request = createRequest({
        status: 'printing',
        note: 'Started printing order',
      });
      const response = await PATCH(request, { params: { id: 'order_123' } });

      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // Email Notification Tests
  // ============================================================================

  describe('Customer Notification', () => {
    it('should send status update email on successful update', async () => {
      const request = createRequest({ status: 'printing' });
      await PATCH(request, { params: { id: 'order_123' } });

      expect(mockSendStatusUpdateEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'customer@example.com',
          customerName: 'Test Customer',
          orderId: 'order_123',
          newStatus: 'printing',
        })
      );
    });

    it('should still succeed even if email fails', async () => {
      mockSendStatusUpdateEmail.mockResolvedValue({
        success: false,
        error: 'Email service unavailable',
      });

      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: { id: 'order_123' } });
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.notification.sent).toBe(false);
      expect(body.notification.error).toBeDefined();
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
          status: 'processing',
          customer_email: 'customer@example.com',
          customer_name: 'Test Customer',
          status_history: [],
        },
        updateResult: null,
        updateError: { message: 'Database error' },
      });

      const request = createRequest({ status: 'printing' });
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
  return new NextRequest('http://localhost/api/admin/orders/order_123/status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
