/**
 * Tests for Orders List API
 * GET /api/orders - List authenticated user's orders with optional status filtering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock dependencies - must be defined before imports
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/orders/tracking', () => ({
  generateTrackingUrl: vi.fn(),
}));

vi.mock('@/lib/orders/status', () => ({
  getStatusLabel: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateTrackingUrl } from '@/lib/orders/tracking';
import { getStatusLabel } from '@/lib/orders/status';

// Helper to create mock request
function createRequest(url: string = 'http://localhost:3000/api/orders'): NextRequest {
  return new NextRequest(new Request(url));
}

// Mock authenticated user
const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
};

// Mock order data
const mockOrders = [
  {
    id: 'order-1',
    order_number: 'FP-2024-001',
    status: 'shipped',
    total: 15000, // 150.00 ILS in agorot
    created_at: '2024-01-15T10:00:00Z',
    tracking_number: 'RR123456789IL',
    carrier: 'israel_post',
    order_items: [{ id: 'item-1' }, { id: 'item-2' }],
  },
  {
    id: 'order-2',
    order_number: 'FP-2024-002',
    status: 'processing',
    total: 8500, // 85.00 ILS in agorot
    created_at: '2024-01-14T09:00:00Z',
    tracking_number: null,
    carrier: null,
    order_items: [{ id: 'item-3' }],
  },
];

describe('GET /api/orders', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(checkRateLimit).mockResolvedValue(null);
    vi.mocked(generateTrackingUrl).mockReturnValue('https://israelpost.co.il/itemtrace?itemcode=RR123456789IL');
    vi.mocked(getStatusLabel).mockImplementation((status) => {
      const labels = {
        shipped: 'Shipped',
        processing: 'Processing',
        pending: 'Pending',
        delivered: 'Delivered',
      };
      return labels[status as keyof typeof labels] || status;
    });
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
      } as any);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized - Please sign in');
    });

    it('should return 401 when auth error occurs', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      } as any);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized - Please sign in');
    });

    it('should return orders for authenticated user', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: mockOrders,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(2);
      expect(data.total).toBe(2);
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 when rate limited', async () => {
      const rateLimitResponse = new Response(
        JSON.stringify({ error: 'Too many requests' }),
        { status: 429 }
      );

      vi.mocked(checkRateLimit).mockResolvedValue(rateLimitResponse as any);

      const request = createRequest();
      const response = await GET(request);

      expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith('general', request);
      expect(response.status).toBe(429);
    });

    it('should call checkRateLimit with correct parameters', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      await GET(request);

      expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith('general', request);
    });
  });

  describe('Input Validation', () => {
    it('should validate status filter values', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('http://localhost:3000/api/orders?status=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid status filter');
    });

    it('should accept valid status filter values', async () => {
      // Create a chainable mock that supports .eq() after .order()
      const createChainableMock = (data: any) => {
        const mock: any = {
          eq: vi.fn(() => mock),
          order: vi.fn(() => mock),
          then: (resolve: any) => resolve({ data, error: null }),
        };
        return mock;
      };

      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => createChainableMock([mockOrders[0]])),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('http://localhost:3000/api/orders?status=shipped');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(1);
      expect(data.orders[0].status).toBe('shipped');
    });
  });

  describe('Success Responses', () => {
    it('should return order list with correct structure', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: mockOrders,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('orders');
      expect(data).toHaveProperty('total');
      expect(Array.isArray(data.orders)).toBe(true);
      expect(data.total).toBe(2);

      // Verify order structure
      const order = data.orders[0];
      expect(order).toHaveProperty('id');
      expect(order).toHaveProperty('orderNumber');
      expect(order).toHaveProperty('status');
      expect(order).toHaveProperty('statusLabel');
      expect(order).toHaveProperty('total');
      expect(order).toHaveProperty('itemCount');
      expect(order).toHaveProperty('createdAt');
      expect(order).toHaveProperty('trackingNumber');
      expect(order).toHaveProperty('trackingUrl');
      expect(order).toHaveProperty('carrier');
    });

    it('should include tracking URL when available', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [mockOrders[0]], // Order with tracking
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders[0].trackingNumber).toBe('RR123456789IL');
      expect(data.orders[0].trackingUrl).toBe('https://israelpost.co.il/itemtrace?itemcode=RR123456789IL');
      expect(vi.mocked(generateTrackingUrl)).toHaveBeenCalledWith('RR123456789IL', 'israel_post');
    });

    it('should handle orders without tracking', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [mockOrders[1]], // Order without tracking
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders[0].trackingNumber).toBeNull();
      expect(data.orders[0].trackingUrl).toBeNull();
    });

    it('should return empty list when no orders found', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(0);
      expect(data.total).toBe(0);
    });
  });

  describe('Filtering and Sorting', () => {
    it('should filter by status parameter', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                eq: vi.fn().mockResolvedValue({
                  data: [mockOrders[0]], // Only shipped order
                  error: null,
                }),
              })),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest('http://localhost:3000/api/orders?status=shipped');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(1);
      expect(data.orders[0].status).toBe('shipped');
    });

    it('should sort by createdAt descending', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn((field, options) => {
                expect(field).toBe('created_at');
                expect(options).toEqual({ ascending: false });
                return {
                  mockResolvedValue: vi.fn().mockResolvedValue({
                    data: mockOrders,
                    error: null,
                  }),
                };
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database connection failed' },
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch orders');
    });

    it('should handle empty results gracefully', async () => {
      const mockSupabaseClient = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: null, // Null data but no error
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(0);
      expect(data.total).toBe(0);
    });

    it('should handle unexpected errors gracefully', async () => {
      vi.mocked(createClient).mockRejectedValue(new Error('Unexpected error'));

      const request = createRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch orders');
    });
  });
});