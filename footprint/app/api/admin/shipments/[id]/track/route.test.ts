/**
 * Shipment Tracking API Tests - INT-07 AC-010
 *
 * Tests for GET /api/admin/shipments/[id]/track
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock verifyAdmin
const mockVerifyAdmin = vi.fn();
vi.mock('@/lib/auth/admin', () => ({
  verifyAdmin: () => mockVerifyAdmin(),
}));

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}));

import { GET } from './route';

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

const mockGetTracking = vi.fn();

vi.mock('@/lib/shipping/providers/shipping-service', () => ({
  getDefaultShippingService: vi.fn(() => ({
    getTracking: mockGetTracking,
  })),
}));

const mockShipment = {
  id: 'shipment-1',
  order_id: 'order-123',
  tracking_number: 'RR123456789IL',
  carrier: 'israel_post',
  status: 'created',
};

function createContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/admin/shipments/[id]/track (AC-010)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: true,
      user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'shipments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockShipment,
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }
      return {};
    });

    mockGetTracking.mockResolvedValue({
      trackingNumber: 'RR123456789IL',
      carrier: 'israel_post',
      status: 'in_transit',
      estimatedDelivery: new Date('2026-02-20'),
      events: [
        {
          timestamp: new Date('2026-02-14T10:00:00Z'),
          status: 'picked_up',
          location: 'Tel Aviv',
          description: 'Package collected',
        },
        {
          timestamp: new Date('2026-02-15T14:00:00Z'),
          status: 'in_transit',
          location: 'Haifa',
          description: 'In transit to destination',
        },
      ],
      lastUpdated: new Date(),
    });
  });

  it('should return tracking status and history', async () => {
    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1/track');
    const response = await GET(request, createContext('shipment-1'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.trackingNumber).toBe('RR123456789IL');
    expect(data.carrier).toBe('israel_post');
    expect(data.status).toBe('in_transit');
    expect(data.events).toHaveLength(2);
  });

  it('should include public tracking URL', async () => {
    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1/track');
    const response = await GET(request, createContext('shipment-1'));
    const data = await response.json();

    expect(data.publicTrackingUrl).toContain('israelpost');
    expect(data.publicTrackingUrl).toContain('RR123456789IL');
  });

  it('should return 404 for non-existent shipment', async () => {
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }));

    const request = new NextRequest('http://localhost/api/admin/shipments/unknown/track');
    const response = await GET(request, createContext('unknown'));

    expect(response.status).toBe(404);
  });

  it('should return 502 on carrier API error (AC-013)', async () => {
    const { ShippingProviderError } = await import(
      '@/lib/shipping/providers/types'
    );
    mockGetTracking.mockRejectedValue(
      new ShippingProviderError('Tracking unavailable', 'TRACKING_ERROR', 'israel_post', false)
    );

    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1/track');
    const response = await GET(request, createContext('shipment-1'));
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain('שגיאה בשירות השילוח');
  });

  it('should return 401 when not authenticated', async () => {
    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: false,
      error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }),
    });

    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1/track');
    const response = await GET(request, createContext('shipment-1'));

    expect(response.status).toBe(401);
  });
});
