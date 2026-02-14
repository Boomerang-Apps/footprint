/**
 * Shipments API Tests - INT-07
 *
 * Tests for creating shipments and listing shipping operations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock verifyAdmin
const mockVerifyAdmin = vi.fn();
vi.mock('@/lib/auth/admin', () => ({
  verifyAdmin: () => mockVerifyAdmin(),
}));

// Mock Supabase
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}));

import { POST, GET } from './route';

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

// Use valid UUID for testing
const TEST_ORDER_ID = '550e8400-e29b-41d4-a716-446655440000';

// Mock address validation
vi.mock('@/lib/shipping/validation', () => ({
  validateAddress: vi.fn(() => ({ valid: true, errors: {} })),
}));

// Mock shipping service
const mockCreateShipment = vi.fn();
const mockGetTracking = vi.fn();
const mockCancelShipment = vi.fn();

vi.mock('@/lib/shipping/providers/shipping-service', () => ({
  getDefaultShippingService: vi.fn(() => ({
    createShipment: mockCreateShipment,
    getTracking: mockGetTracking,
    cancelShipment: mockCancelShipment,
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
    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: true,
      user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' },
    });

    // Default: order exists with valid address
    mockFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: TEST_ORDER_ID,
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
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'admin_audit_log') {
        return {
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
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
  });

  describe('Authentication (AC-015)', () => {
    it('should return 401 when not authenticated', async () => {
      mockVerifyAdmin.mockResolvedValue({
        isAuthorized: false,
        error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }),
      });

      const request = createPostRequest({ orderId: TEST_ORDER_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('נדרשת הזדהות');
    });

    it('should return 403 when user is not admin', async () => {
      mockVerifyAdmin.mockResolvedValue({
        isAuthorized: false,
        error: NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 403 }),
      });

      const request = createPostRequest({ orderId: TEST_ORDER_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('נדרשת הרשאת מנהל');
    });
  });

  describe('Validation', () => {
    it('should return 400 when orderId is missing', async () => {
      const request = createPostRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
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

      const request = createPostRequest({ orderId: TEST_ORDER_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('לא נמצאה');
    });

    it('should return 400 when order has no shipping address', async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: TEST_ORDER_ID,
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

      const request = createPostRequest({ orderId: TEST_ORDER_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('כתובת משלוח');
    });
  });

  describe('Shipment Creation (AC-001)', () => {
    it('should create shipment successfully', async () => {
      const request = createPostRequest({
        orderId: TEST_ORDER_ID,
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
      const request = createPostRequest({ orderId: TEST_ORDER_ID });
      await POST(request);

      expect(mockCreateShipment).toHaveBeenCalled();
    });

    it('should return label URL (AC-003)', async () => {
      const request = createPostRequest({ orderId: TEST_ORDER_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(data.labelUrl).toBeDefined();
    });

    it('should support different service types (AC-017)', async () => {
      const request = createPostRequest({
        orderId: TEST_ORDER_ID,
        serviceType: 'express',
      });
      await POST(request);

      const callArgs = mockCreateShipment.mock.calls[0][0];
      expect(callArgs.serviceType).toBe('express');
    });
  });

  describe('Carrier Error Handling (AC-013)', () => {
    it('should return 502 on carrier API error', async () => {
      const { ShippingProviderError } = await import(
        '@/lib/shipping/providers/types'
      );
      mockCreateShipment.mockRejectedValue(
        new ShippingProviderError('Provider unavailable', 'PROVIDER_DOWN', 'israel_post', true)
      );

      const request = createPostRequest({ orderId: TEST_ORDER_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(502);
      expect(data.error).toContain('שגיאה בשירות השילוח');
    });

    it('should return 500 on unexpected error', async () => {
      mockCreateShipment.mockRejectedValue(new Error('Unexpected'));

      const request = createPostRequest({ orderId: TEST_ORDER_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('שגיאת מערכת');
    });
  });

  describe('Audit Logging (AC-016)', () => {
    it('should log shipment creation to audit log', async () => {
      let auditInsertCalled = false;
      mockFrom.mockImplementation((table: string) => {
        if (table === 'orders') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: TEST_ORDER_ID,
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
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          };
        }
        if (table === 'admin_audit_log') {
          auditInsertCalled = true;
          return {
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        return { insert: vi.fn().mockResolvedValue({ data: null, error: null }) };
      });

      const request = createPostRequest({ orderId: TEST_ORDER_ID });
      await POST(request);

      expect(auditInsertCalled).toBe(true);
    });
  });
});

describe('GET /api/admin/shipments', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: true,
      user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' },
    });

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'shipment-1',
                order_id: TEST_ORDER_ID,
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
              order_id: TEST_ORDER_ID,
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
    const request = createGetRequest({ orderId: TEST_ORDER_ID });
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('should return 401 when not authenticated', async () => {
    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: false,
      error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }),
    });

    const request = createGetRequest();
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('נדרשת הזדהות');
  });
});
