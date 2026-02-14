/**
 * Admin Orders List API Tests - BE-03
 *
 * Tests for GET /api/admin/orders - List all orders with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock verifyAdmin
const mockVerifyAdmin = vi.fn();
vi.mock('@/lib/auth/admin', () => ({
  verifyAdmin: () => mockVerifyAdmin(),
}));

// Mock Supabase
const mockSupabaseSelect = vi.fn();
const mockSupabaseOrder = vi.fn();
const mockSupabaseRange = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseGte = vi.fn();
const mockSupabaseLte = vi.fn();
const mockSupabaseIlike = vi.fn();

const mockSupabaseFrom = vi.fn(() => ({
  select: mockSupabaseSelect,
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    from: mockSupabaseFrom,
  })),
}));

// Mock rate limiter
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

import { GET } from './route';

// Sample test data
const mockOrders = [
  {
    id: 'order-1',
    order_number: 'FP-2024-001',
    user_id: 'user-1',
    status: 'shipped',
    total: 23700, // in agorot
    created_at: '2024-12-25T10:00:00Z',
    updated_at: '2024-12-26T10:00:00Z',
    profiles: { email: 'customer1@example.com', name: 'John Doe' },
    order_items: [{ id: 'item-1', style: 'pop_art', size: 'A4' }],
  },
  {
    id: 'order-2',
    order_number: 'FP-2024-002',
    user_id: 'user-2',
    status: 'processing',
    total: 45600,
    created_at: '2024-12-24T10:00:00Z',
    updated_at: '2024-12-24T12:00:00Z',
    profiles: { email: 'customer2@example.com', name: 'Jane Smith' },
    order_items: [{ id: 'item-2', style: 'watercolor', size: 'A3' }],
  },
];

// Helper to create mock request
function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:3000'));
}

// Setup chain mocks
function setupSupabaseChain(data: any[], count: number = data.length) {
  mockSupabaseSelect.mockReturnValue({
    order: mockSupabaseOrder,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
  });
  mockSupabaseOrder.mockReturnValue({
    range: mockSupabaseRange,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
  });
  mockSupabaseRange.mockResolvedValue({
    data,
    error: null,
    count,
  });
  mockSupabaseEq.mockReturnValue({
    order: mockSupabaseOrder,
    range: mockSupabaseRange,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
  });
  mockSupabaseGte.mockReturnValue({
    order: mockSupabaseOrder,
    range: mockSupabaseRange,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
  });
  mockSupabaseLte.mockReturnValue({
    order: mockSupabaseOrder,
    range: mockSupabaseRange,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
  });
  mockSupabaseIlike.mockReturnValue({
    order: mockSupabaseOrder,
    range: mockSupabaseRange,
    eq: mockSupabaseEq,
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
  });
}

describe('GET /api/admin/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: true,
      user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' },
    });
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockVerifyAdmin.mockResolvedValue({
        isAuthorized: false,
        error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }),
      });

      const request = createRequest('/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('נדרשת הזדהות');
    });

    it('should return 403 when user is not admin', async () => {
      mockVerifyAdmin.mockResolvedValue({
        isAuthorized: false,
        error: NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 403 }),
      });

      const request = createRequest('/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('נדרשת הרשאת מנהל');
    });

    it('should allow admin users to access', async () => {
      setupSupabaseChain(mockOrders);

      const request = createRequest('/api/admin/orders');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Success Responses', () => {
    it('should return orders with correct structure', async () => {
      setupSupabaseChain(mockOrders, 2);

      const request = createRequest('/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toBeDefined();
      expect(data.total).toBe(2);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
    });

    it('should transform order data correctly', async () => {
      setupSupabaseChain([mockOrders[0]], 1);

      const request = createRequest('/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      const order = data.orders[0];
      expect(order.id).toBe('order-1');
      expect(order.orderNumber).toBe('FP-2024-001');
      expect(order.status).toBe('shipped');
      expect(order.total).toBe(237); // Converted from agorot to ILS
      expect(order.customerEmail).toBe('customer1@example.com');
      expect(order.customerName).toBe('John Doe');
      expect(order.itemCount).toBe(1);
    });

    it('should return empty array when no orders exist', async () => {
      setupSupabaseChain([], 0);

      const request = createRequest('/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  describe('Pagination', () => {
    it('should use default pagination (page 1, limit 20)', async () => {
      setupSupabaseChain(mockOrders);

      const request = createRequest('/api/admin/orders');
      await GET(request);

      expect(mockSupabaseRange).toHaveBeenCalledWith(0, 19);
    });

    it('should apply custom pagination parameters', async () => {
      setupSupabaseChain(mockOrders);

      const request = createRequest('/api/admin/orders?page=2&limit=10');
      await GET(request);

      expect(mockSupabaseRange).toHaveBeenCalledWith(10, 19);
    });

    it('should cap limit at 100', async () => {
      setupSupabaseChain(mockOrders);

      const request = createRequest('/api/admin/orders?limit=500');
      await GET(request);

      expect(mockSupabaseRange).toHaveBeenCalledWith(0, 99);
    });

    it('should return pagination metadata', async () => {
      setupSupabaseChain(mockOrders, 50);

      const request = createRequest('/api/admin/orders?page=2&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(data.page).toBe(2);
      expect(data.limit).toBe(10);
      expect(data.total).toBe(50);
      expect(data.totalPages).toBe(5);
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      setupSupabaseChain(mockOrders);
    });

    it('should filter by status', async () => {
      const request = createRequest('/api/admin/orders?status=shipped');
      await GET(request);

      expect(mockSupabaseEq).toHaveBeenCalledWith('status', 'shipped');
    });

    it('should filter by date range (from)', async () => {
      const request = createRequest('/api/admin/orders?from=2024-12-01');
      await GET(request);

      expect(mockSupabaseGte).toHaveBeenCalledWith('created_at', '2024-12-01T00:00:00.000Z');
    });

    it('should filter by date range (to)', async () => {
      const request = createRequest('/api/admin/orders?to=2024-12-31');
      await GET(request);

      expect(mockSupabaseLte).toHaveBeenCalledWith('created_at', '2024-12-31T23:59:59.999Z');
    });

    it('should search by order number', async () => {
      const request = createRequest('/api/admin/orders?search=FP-2024');
      await GET(request);

      expect(mockSupabaseIlike).toHaveBeenCalledWith('order_number', '%FP-2024%');
    });

    it('should reject invalid status values', async () => {
      const request = createRequest('/api/admin/orders?status=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid status');
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      setupSupabaseChain(mockOrders);
    });

    it('should sort by created_at descending by default', async () => {
      const request = createRequest('/api/admin/orders');
      await GET(request);

      expect(mockSupabaseOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should sort by specified field', async () => {
      const request = createRequest('/api/admin/orders?sortBy=total');
      await GET(request);

      expect(mockSupabaseOrder).toHaveBeenCalledWith('total', { ascending: false });
    });

    it('should support ascending sort order', async () => {
      const request = createRequest('/api/admin/orders?sortBy=created_at&sortOrder=asc');
      await GET(request);

      expect(mockSupabaseOrder).toHaveBeenCalledWith('created_at', { ascending: true });
    });

    it('should reject invalid sort fields', async () => {
      const request = createRequest('/api/admin/orders?sortBy=password');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid sort field');
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockSupabaseSelect.mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      const request = createRequest('/api/admin/orders');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch orders');
    });

    it('should handle auth errors gracefully', async () => {
      mockVerifyAdmin.mockResolvedValue({
        isAuthorized: false,
        error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }),
      });

      const request = createRequest('/api/admin/orders');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });
});
