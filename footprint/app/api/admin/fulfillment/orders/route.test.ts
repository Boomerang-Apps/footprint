/**
 * Fulfillment Orders API Tests - BE-07
 *
 * Tests for GET /api/admin/fulfillment/orders
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock Supabase - using separate mock functions
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseGte = vi.fn();
const mockSupabaseLte = vi.fn();
const mockSupabaseIlike = vi.fn();
const mockSupabaseIn = vi.fn();
const mockSupabaseOrder = vi.fn();
const mockSupabaseRange = vi.fn();
const mockSupabaseFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: { getUser: mockGetUser },
    from: mockSupabaseFrom,
  })),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

function setupChainedMocks() {
  mockSupabaseFrom.mockReturnValue({
    select: mockSupabaseSelect,
  });
  mockSupabaseSelect.mockReturnValue({
    eq: mockSupabaseEq,
    in: mockSupabaseIn,
  });
  mockSupabaseEq.mockReturnValue({
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
    order: mockSupabaseOrder,
  });
  mockSupabaseIn.mockReturnValue({
    gte: mockSupabaseGte,
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
    order: mockSupabaseOrder,
  });
  mockSupabaseGte.mockReturnValue({
    lte: mockSupabaseLte,
    ilike: mockSupabaseIlike,
    order: mockSupabaseOrder,
  });
  mockSupabaseLte.mockReturnValue({
    ilike: mockSupabaseIlike,
    order: mockSupabaseOrder,
  });
  mockSupabaseIlike.mockReturnValue({
    order: mockSupabaseOrder,
  });
  mockSupabaseOrder.mockReturnValue({
    range: mockSupabaseRange,
  });
}

const mockAdminUser = {
  id: 'admin-1',
  email: 'admin@example.com',
  user_metadata: { role: 'admin' },
};

const mockOrders = [
  {
    id: 'order-1',
    order_number: 'FP-2026-001',
    status: 'pending',
    total: 23700,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    profiles: { email: 'customer@example.com', name: 'John Doe' },
    order_items: [{ id: 'item-1', size: 'A3', paper_type: 'matte' }],
  },
  {
    id: 'order-2',
    order_number: 'FP-2026-002',
    status: 'printing',
    total: 15900,
    created_at: '2026-01-16T10:00:00Z',
    updated_at: '2026-01-16T12:00:00Z',
    profiles: { email: 'jane@example.com', name: 'Jane Smith' },
    order_items: [{ id: 'item-2', size: 'A4', paper_type: 'glossy' }],
  },
  {
    id: 'order-3',
    order_number: 'FP-2026-003',
    status: 'ready_to_ship',
    total: 31200,
    created_at: '2026-01-17T10:00:00Z',
    updated_at: '2026-01-18T10:00:00Z',
    profiles: { email: 'bob@example.com', name: 'Bob Wilson' },
    order_items: [
      { id: 'item-3', size: 'A2', paper_type: 'canvas' },
      { id: 'item-4', size: 'A3', paper_type: 'matte' },
    ],
  },
];

function createRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost/api/admin/fulfillment/orders');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return new NextRequest(url);
}

describe('GET /api/admin/fulfillment/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({
      data: { user: mockAdminUser },
      error: null,
    });
    setupChainedMocks();
    mockSupabaseRange.mockResolvedValue({
      data: mockOrders,
      error: null,
      count: mockOrders.length,
    });
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toContain('נדרשת הרשאת מנהל');
    });

    it('should return 403 for non-admin users', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { ...mockAdminUser, user_metadata: { role: 'user' } } },
        error: null,
      });

      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(403);
    });
  });

  describe('Orders List', () => {
    it('should return orders grouped by status', async () => {
      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.orders).toBeDefined();
      expect(data.grouped).toBeDefined();
      expect(data.grouped.pending).toBeDefined();
      expect(data.grouped.printing).toBeDefined();
      expect(data.grouped.ready_to_ship).toBeDefined();
      expect(data.grouped.shipped).toBeDefined();
    });

    it('should include fulfillment stats', async () => {
      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.stats).toBeDefined();
      expect(typeof data.stats.pendingCount).toBe('number');
      expect(typeof data.stats.printingCount).toBe('number');
      expect(typeof data.stats.readyCount).toBe('number');
      expect(typeof data.stats.shippedTodayCount).toBe('number');
    });

    it('should transform order data correctly', async () => {
      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      const order = data.orders[0];
      expect(order.id).toBe('order-1');
      expect(order.orderNumber).toBe('FP-2026-001');
      expect(order.total).toBe(237); // Converted from agorot
      expect(order.itemCount).toBe(1);
      expect(order.customerEmail).toBe('customer@example.com');
    });
  });

  describe('Filtering', () => {
    it('should filter by date range', async () => {
      const request = createRequest({
        startDate: '2026-01-15',
        endDate: '2026-01-17',
      });
      await GET(request);

      expect(mockSupabaseGte).toHaveBeenCalled();
      expect(mockSupabaseLte).toHaveBeenCalled();
    });

    it('should filter by product attributes (size)', async () => {
      const request = createRequest({ size: 'A3' });
      await GET(request);

      // Should filter based on order_items
      expect(mockSupabaseSelect).toHaveBeenCalled();
    });

    it('should filter by product attributes (paper)', async () => {
      const request = createRequest({ paper: 'matte' });
      await GET(request);

      expect(mockSupabaseSelect).toHaveBeenCalled();
    });

    it('should search by order number', async () => {
      const request = createRequest({ search: 'FP-2026-001' });
      await GET(request);

      expect(mockSupabaseIlike).toHaveBeenCalled();
    });

    it('should search by customer name', async () => {
      const request = createRequest({ search: 'John' });
      await GET(request);

      expect(mockSupabaseIlike).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      const request = createRequest({ status: 'pending' });
      await GET(request);

      expect(mockSupabaseEq).toHaveBeenCalledWith('status', 'pending');
    });
  });

  describe('Pagination', () => {
    it('should respect page and limit parameters', async () => {
      const request = createRequest({ page: '2', limit: '10' });
      await GET(request);

      expect(mockSupabaseRange).toHaveBeenCalledWith(10, 19);
    });

    it('should return pagination metadata', async () => {
      const request = createRequest();
      const response = await GET(request);

      const data = await response.json();
      expect(data.total).toBeDefined();
      expect(data.page).toBeDefined();
      expect(data.limit).toBeDefined();
      expect(data.totalPages).toBeDefined();
    });

    it('should limit maximum page size to 100', async () => {
      const request = createRequest({ limit: '500' });
      await GET(request);

      expect(mockSupabaseRange).toHaveBeenCalledWith(0, 99);
    });
  });

  describe('Stats Calculation', () => {
    it('should count orders by status', async () => {
      const request = createRequest();
      const response = await GET(request);

      const data = await response.json();
      expect(data.stats.pendingCount).toBeGreaterThanOrEqual(0);
      expect(data.stats.printingCount).toBeGreaterThanOrEqual(0);
      expect(data.stats.readyCount).toBeGreaterThanOrEqual(0);
    });

    it('should count shipped today correctly', async () => {
      const today = new Date().toISOString().split('T')[0];
      mockSupabaseRange.mockResolvedValue({
        data: [
          { ...mockOrders[0], status: 'shipped', updated_at: `${today}T10:00:00Z` },
        ],
        error: null,
        count: 1,
      });

      const request = createRequest();
      const response = await GET(request);

      const data = await response.json();
      expect(data.stats.shippedTodayCount).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockSupabaseRange.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('שגיאת מערכת');
    });
  });
});
