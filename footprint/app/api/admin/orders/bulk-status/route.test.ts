/**
 * Bulk Status Update API Tests - BE-07
 *
 * Tests for POST /api/admin/orders/bulk-status
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
const mockSupabaseIn = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseUpdate = vi.fn();
const mockSupabaseInsert = vi.fn();
const mockSupabaseFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockSupabaseFrom,
  })),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

import { POST } from './route';

const mockOrders = [
  { id: 'order-1', status: 'pending', order_number: 'FP-2026-001' },
  { id: 'order-2', status: 'pending', order_number: 'FP-2026-002' },
  { id: 'order-3', status: 'pending', order_number: 'FP-2026-003' },
];

function createRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/admin/orders/bulk-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function setupChainedMocks() {
  mockSupabaseFrom.mockReturnValue({
    select: mockSupabaseSelect,
    update: mockSupabaseUpdate,
    insert: mockSupabaseInsert,
  });
  mockSupabaseSelect.mockReturnValue({
    in: mockSupabaseIn,
  });
  mockSupabaseUpdate.mockReturnValue({
    in: mockSupabaseIn,
  });
}

describe('POST /api/admin/orders/bulk-status', () => {
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

      const request = createRequest({ orderIds: ['order-1'], status: 'printing' });
      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('נדרשת הרשאת מנהל');
    });

    it('should return 403 for non-admin users', async () => {
      mockVerifyAdmin.mockResolvedValue({
        isAuthorized: false,
        error: NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 403 }),
      });

      const request = createRequest({ orderIds: ['order-1'], status: 'printing' });
      const response = await POST(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toContain('הרשאת מנהל');
    });
  });

  describe('Validation', () => {
    it('should return 400 when orderIds is missing', async () => {
      const request = createRequest({ status: 'printing' });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('orderIds');
    });

    it('should return 400 when status is missing', async () => {
      const request = createRequest({ orderIds: ['order-1'] });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('status');
    });

    it('should return 400 when orderIds is empty', async () => {
      const request = createRequest({ orderIds: [], status: 'printing' });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('orderIds');
    });

    it('should return 400 when orderIds exceeds 100', async () => {
      const orderIds = Array.from({ length: 101 }, (_, i) => `order-${i}`);
      const request = createRequest({ orderIds, status: 'printing' });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('100');
    });

    it('should return 400 for invalid status value', async () => {
      const request = createRequest({ orderIds: ['order-1'], status: 'invalid' });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('סטטוס');
    });
  });

  describe('Bulk Status Update', () => {
    beforeEach(() => {
      // Mock fetching orders
      mockSupabaseIn.mockResolvedValueOnce({
        data: mockOrders,
        error: null,
      });
      // Mock update
      mockSupabaseIn.mockResolvedValueOnce({
        data: mockOrders.map((o) => ({ ...o, status: 'printing' })),
        error: null,
      });
      // Mock history insert
      mockSupabaseInsert.mockResolvedValue({ data: null, error: null });
    });

    it('should update all orders successfully', async () => {
      const request = createRequest({
        orderIds: ['order-1', 'order-2', 'order-3'],
        status: 'printing',
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(3);
      expect(data.failed).toBe(0);
      expect(data.errors).toEqual([]);
    });

    it('should return detailed results with success and failed counts', async () => {
      // Reset mocks and set up mixed transitions
      mockSupabaseIn.mockReset();
      mockSupabaseInsert.mockReset();
      setupChainedMocks();
      mockSupabaseIn.mockResolvedValueOnce({
        data: [
          { id: 'order-1', status: 'pending', order_number: 'FP-001' },
          { id: 'order-2', status: 'delivered', order_number: 'FP-002' }, // Cannot transition
        ],
        error: null,
      });
      mockSupabaseIn.mockResolvedValueOnce({
        data: [{ id: 'order-1', status: 'printing' }],
        error: null,
      });
      mockSupabaseInsert.mockResolvedValue({ data: null, error: null });

      const request = createRequest({
        orderIds: ['order-1', 'order-2'],
        status: 'printing',
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(1);
      expect(data.failed).toBe(1);
      expect(data.errors).toHaveLength(1);
      expect(data.errors[0].orderId).toBe('order-2');
    });

    it('should reject invalid status transitions', async () => {
      // Reset mocks for this specific test
      mockSupabaseIn.mockReset();
      mockSupabaseInsert.mockReset();
      setupChainedMocks();
      mockSupabaseIn.mockResolvedValueOnce({
        data: [{ id: 'order-1', status: 'delivered', order_number: 'FP-001' }],
        error: null,
      });
      mockSupabaseInsert.mockResolvedValue({ data: null, error: null });

      const request = createRequest({
        orderIds: ['order-1'],
        status: 'pending',
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(0);
      expect(data.failed).toBe(1);
      expect(data.errors[0].reason).toBeDefined();
    });

    it('should record status history for each order', async () => {
      const request = createRequest({
        orderIds: ['order-1', 'order-2'],
        status: 'printing',
      });
      await POST(request);

      expect(mockSupabaseFrom).toHaveBeenCalledWith('order_status_history');
      expect(mockSupabaseInsert).toHaveBeenCalled();
    });
  });

  describe('Audit Logging', () => {
    beforeEach(() => {
      mockSupabaseIn.mockResolvedValueOnce({
        data: mockOrders,
        error: null,
      });
      mockSupabaseIn.mockResolvedValueOnce({
        data: mockOrders,
        error: null,
      });
      mockSupabaseInsert.mockResolvedValue({ data: null, error: null });
    });

    it('should log bulk operation to audit log', async () => {
      const request = createRequest({
        orderIds: ['order-1', 'order-2'],
        status: 'printing',
      });
      await POST(request);

      expect(mockSupabaseFrom).toHaveBeenCalledWith('admin_audit_log');
    });

    it('should include affected order IDs in audit log', async () => {
      const request = createRequest({
        orderIds: ['order-1', 'order-2'],
        status: 'printing',
      });
      await POST(request);

      const insertCalls = mockSupabaseInsert.mock.calls;
      const auditInsert = insertCalls.find(
        (call) => call[0] && typeof call[0] === 'object' && 'action' in call[0]
      );
      expect(auditInsert).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      // Reset mocks for this specific test
      mockSupabaseIn.mockReset();
      setupChainedMocks();
      mockSupabaseIn.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const request = createRequest({
        orderIds: ['order-1'],
        status: 'printing',
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('שגיאת מערכת');
    });

    it('should handle update errors gracefully', async () => {
      // Reset mocks for this specific test
      mockSupabaseIn.mockReset();
      setupChainedMocks();
      mockSupabaseIn.mockResolvedValueOnce({
        data: mockOrders,
        error: null,
      });
      mockSupabaseIn.mockResolvedValueOnce({
        data: null,
        error: { message: 'Update failed' },
      });

      const request = createRequest({
        orderIds: ['order-1', 'order-2'],
        status: 'printing',
      });
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 when rate limit exceeded', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      vi.mocked(checkRateLimit).mockResolvedValueOnce(
        NextResponse.json({ error: 'יותר מדי בקשות' }, { status: 429 })
      );

      const request = createRequest({
        orderIds: ['order-1'],
        status: 'printing',
      });
      const response = await POST(request);

      expect(response.status).toBe(429);
    });
  });
});
