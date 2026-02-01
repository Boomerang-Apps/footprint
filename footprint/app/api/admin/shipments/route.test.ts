/**
 * Shipments API Tests - INT-07
 *
 * Tests for creating shipments and managing shipping operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from './route';

// Mock Supabase
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    })
  ),
}));

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

// Mock shipping service
const mockCreateShipment = vi.fn();
const mockGetTracking = vi.fn();

vi.mock('@/lib/shipping/providers/shipping-service', () => ({
  getDefaultShippingService: vi.fn(() => ({
    createShipment: mockCreateShipment,
    getTracking: mockGetTracking,
    getAvailableProviders: vi.fn(() => [
      { carrier: 'israel_post', name: 'Israel Post', isConfigured: () => true },
    ]),
  })),
}));

function createPostRequest(body: object): NextRequest {
  return new NextRequest('http://localhost/api/admin/shipments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createGetRequest(params?: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/admin/shipments');
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return new NextRequest(url, { method: 'GET' });
}

describe('POST /api/admin/shipments', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated admin user
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', user_metadata: { role: 'admin' } } },
      error: null,
    });

    // Default: order exists
    mockFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'order-123',
                  order_number: 'FP-2026-001',
                  fulfillment_status: 'ready_to_ship',
                  total: 250,
                  shipping_address: {
                    name: 'Customer',
                    street: 'Herzl 50',
                    city: 'Haifa',
                    postalCode: '3303500',
                    country: 'Israel',
                    phone: '052-1234567',
                  },
                },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }
      if (table === 'shipments') {
        return {
          insert: vi.fn().mockResolvedValue({ data: { id: 'shipment-1' }, error: null }),
          select: mockSelect,
        };
      }
      return { select: mockSelect, insert: mockInsert, update: mockUpdate };
    });

    // Default: shipment creation succeeds
    mockCreateShipment.mockResolvedValue({
      success: true,
      shipmentId: 'ISP-12345',
      trackingNumber: 'RR123456789IL',
      carrier: 'israel_post',
      labelUrl: 'https://israelpost.co.il/labels/ISP-12345.pdf',
    });

    // Default: database insert succeeds
    mockInsert.mockResolvedValue({ data: { id: 'shipment-1' }, error: null });

    // Default: database update succeeds
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = createPostRequest({ orderId: 'order-123' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should return 403 when user is not admin', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: { id: 'user-1', user_metadata: { role: 'customer' } } },
        error: null,
      });

      const request = createPostRequest({ orderId: 'order-123' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Admin');
    });
  });

  describe('Validation', () => {
    it('should return 400 when orderId is missing', async () => {
      const request = createPostRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('orderId');
    });

    it('should return 404 when order not found', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }
        return { select: mockSelect, insert: mockInsert };
      });

      const request = createPostRequest({ orderId: 'order-123' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Order not found');
    });

    it('should return 400 when order has no shipping address', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'order-123',
                    order_number: 'FP-2026-001',
                    fulfillment_status: 'ready_to_ship',
                    shipping_address: null,
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return { select: mockSelect, insert: mockInsert };
      });

      const request = createPostRequest({ orderId: 'order-123' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('shipping address');
    });
  });

  describe('Shipment Creation', () => {
    it('should create shipment successfully', async () => {
      const request = createPostRequest({
        orderId: 'order-123',
        carrier: 'israel_post',
        serviceType: 'registered',
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.trackingNumber).toBe('RR123456789IL');
      expect(data.carrier).toBe('israel_post');
    });

    it('should use default carrier when not specified', async () => {
      const request = createPostRequest({ orderId: 'order-123' });
      await POST(request);

      expect(mockCreateShipment).toHaveBeenCalled();
    });

    it('should return label URL', async () => {
      const request = createPostRequest({ orderId: 'order-123' });
      const response = await POST(request);
      const data = await response.json();

      expect(data.labelUrl).toBeDefined();
    });

    it('should handle provider error', async () => {
      mockCreateShipment.mockRejectedValue(new Error('Provider unavailable'));

      const request = createPostRequest({ orderId: 'order-123' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to create shipment');
    });
  });
});

describe('GET /api/admin/shipments', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', user_metadata: { role: 'admin' } } },
      error: null,
    });

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'shipment-1',
                order_id: 'order-123',
                tracking_number: 'RR123456789IL',
                carrier: 'israel_post',
                status: 'in_transit',
              },
            ],
            error: null,
            count: 1,
          }),
        }),
      }),
      order: vi.fn().mockReturnValue({
        range: vi.fn().mockResolvedValue({
          data: [
            {
              id: 'shipment-1',
              order_id: 'order-123',
              tracking_number: 'RR123456789IL',
              carrier: 'israel_post',
              status: 'in_transit',
            },
          ],
          error: null,
          count: 1,
        }),
      }),
    });
  });

  it('should return shipments list', async () => {
    const request = createGetRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.shipments).toHaveLength(1);
    expect(data.shipments[0].tracking_number).toBe('RR123456789IL');
  });

  it('should filter by order ID', async () => {
    const request = createGetRequest({ orderId: 'order-123' });
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('should return 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const request = createGetRequest();
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
