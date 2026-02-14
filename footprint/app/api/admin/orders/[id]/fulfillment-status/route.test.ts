/**
 * Single Order Fulfillment Status API Tests - BE-07
 *
 * Tests for PATCH /api/admin/orders/[id]/fulfillment-status
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock verifyAdmin
const mockVerifyAdmin = vi.fn();
vi.mock('@/lib/auth/admin', () => ({
  verifyAdmin: () => mockVerifyAdmin(),
}));

// Mock Supabase - using separate mock functions
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseSingle = vi.fn();
const mockSupabaseFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockSupabaseFrom,
  })),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

import { PATCH } from './route';

function setupChainedMocks() {
  mockSupabaseFrom.mockReturnValue({
    select: mockSupabaseSelect,
    update: mockSupabaseUpdate,
    insert: mockSupabaseInsert,
  });
  mockSupabaseSelect.mockReturnValue({
    eq: mockSupabaseEq,
    single: mockSupabaseSingle, // For: update().eq().select().single()
  });
  mockSupabaseUpdate.mockReturnValue({
    eq: mockSupabaseEq,
  });
  mockSupabaseEq.mockReturnValue({
    select: mockSupabaseSelect,
    single: mockSupabaseSingle,
  });
}

const mockOrder = {
  id: 'order-1',
  order_number: 'FP-2026-001',
  status: 'pending',
  total: 23700,
  created_at: '2026-01-15T10:00:00Z',
  updated_at: '2026-01-15T10:00:00Z',
};

function createRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/admin/orders/order-1/fulfillment-status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('PATCH /api/admin/orders/[id]/fulfillment-status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: true,
      user: { id: 'admin-1', email: 'admin@example.com', role: 'admin' },
    });
    setupChainedMocks();
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockVerifyAdmin.mockResolvedValue({
        isAuthorized: false,
        error: NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 401 }),
      });

      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('נדרשת הרשאת מנהל');
    });

    it('should return 403 for non-admin users', async () => {
      mockVerifyAdmin.mockResolvedValue({
        isAuthorized: false,
        error: NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 403 }),
      });

      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response.status).toBe(403);
    });
  });

  describe('Validation', () => {
    it('should return 400 when status is missing', async () => {
      const request = createRequest({});
      const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('status');
    });

    it('should return 400 for invalid status value', async () => {
      const request = createRequest({ status: 'invalid_status' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('סטטוס');
    });

    it('should return 404 when order not found', async () => {
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Not found' },
      });

      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'non-existent' }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toContain('הזמנה לא נמצאה');
    });
  });

  describe('Status Update', () => {
    it('should update order status successfully', async () => {
      // Setup mocks for this test
      mockSupabaseSingle.mockResolvedValueOnce({
        data: mockOrder,
        error: null,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: { ...mockOrder, status: 'printing', updated_at: new Date().toISOString() },
        error: null,
      });
      mockSupabaseInsert.mockResolvedValue({ data: null, error: null });

      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.order.status).toBe('printing');
    });

    it('should return updated order details', async () => {
      mockSupabaseSingle.mockResolvedValueOnce({
        data: mockOrder,
        error: null,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: { ...mockOrder, status: 'printing', updated_at: new Date().toISOString() },
        error: null,
      });
      mockSupabaseInsert.mockResolvedValue({ data: null, error: null });

      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) });

      const data = await response.json();
      expect(data.order.id).toBe('order-1');
      expect(data.order.updatedAt).toBeDefined();
    });

    it('should validate status transition', async () => {
      mockSupabaseSingle.mockResolvedValueOnce({
        data: { ...mockOrder, status: 'delivered' }, // Terminal status
        error: null,
      });

      const request = createRequest({ status: 'pending' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('מעבר');
    });

    it('should record status history', async () => {
      mockSupabaseSingle.mockResolvedValueOnce({
        data: mockOrder,
        error: null,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: { ...mockOrder, status: 'printing', updated_at: new Date().toISOString() },
        error: null,
      });
      mockSupabaseInsert.mockResolvedValue({ data: null, error: null });

      const request = createRequest({ status: 'printing' });
      await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(mockSupabaseFrom).toHaveBeenCalledWith('order_status_history');
      expect(mockSupabaseInsert).toHaveBeenCalled();
    });

    it('should accept optional note field', async () => {
      mockSupabaseSingle.mockResolvedValueOnce({
        data: mockOrder,
        error: null,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: { ...mockOrder, status: 'printing', updated_at: new Date().toISOString() },
        error: null,
      });
      mockSupabaseInsert.mockResolvedValue({ data: null, error: null });

      const request = createRequest({ status: 'printing', note: 'Starting print job' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database connection error', async () => {
      // Mock a real database error (not "not found")
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'connection refused', code: 'ECONNREFUSED' },
      });

      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) });

      // When data is null and there's an error that's not "not found", return 500
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('שגיאת מערכת');
    });

    it('should return 500 on database error during update', async () => {
      mockSupabaseSingle.mockResolvedValueOnce({
        data: mockOrder,
        error: null,
      });
      mockSupabaseSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      });

      const request = createRequest({ status: 'printing' });
      const response = await PATCH(request, { params: Promise.resolve({ id: 'order-1' }) });

      expect(response.status).toBe(500);
    });
  });
});
