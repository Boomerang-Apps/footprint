/**
 * Shipping Quote API Tests - INT-07 AC-007
 *
 * Tests for GET /api/admin/shipments/quote
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

const mockGetRates = vi.fn();
const mockGetAllRates = vi.fn();

vi.mock('@/lib/shipping/providers/shipping-service', () => ({
  getDefaultShippingService: vi.fn(() => ({
    getRates: mockGetRates,
    getAllRates: mockGetAllRates,
  })),
}));

const mockOrder = {
  id: 'order-123',
  order_number: 'FP-2026-001',
  shipping_address: {
    name: 'Customer',
    street: 'Herzl 50',
    city: 'Haifa',
    postalCode: '3303500',
    country: 'Israel',
    phone: '052-1234567',
  },
};

function createGetRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/admin/shipments/quote');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return new NextRequest(url, { method: 'GET' });
}

describe('GET /api/admin/shipments/quote (AC-007)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: true,
      user: { id: 'admin-user-id', email: 'admin@footprint.co.il', role: 'admin' },
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'orders') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockOrder,
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    mockGetRates.mockResolvedValue([
      {
        serviceType: 'standard',
        price: 25,
        currency: 'ILS',
        estimatedDays: { min: 3, max: 5 },
        carrier: 'israel_post',
      },
      {
        serviceType: 'registered',
        price: 35,
        currency: 'ILS',
        estimatedDays: { min: 2, max: 4 },
        carrier: 'israel_post',
      },
    ]);

    mockGetAllRates.mockResolvedValue([
      {
        serviceType: 'standard',
        price: 25,
        currency: 'ILS',
        estimatedDays: { min: 3, max: 5 },
        carrier: 'israel_post',
      },
    ]);
  });

  it('should return shipping quotes for specific carrier', async () => {
    const request = createGetRequest({ orderId: 'order-123', carrier: 'israel_post' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.orderId).toBe('order-123');
    expect(data.rates).toHaveLength(2);
    expect(data.rates[0].carrier).toBe('israel_post');
  });

  it('should return quotes from all carriers when none specified', async () => {
    const request = createGetRequest({ orderId: 'order-123' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.rates).toBeDefined();
    expect(mockGetAllRates).toHaveBeenCalled();
  });

  it('should return 400 when orderId missing', async () => {
    const request = createGetRequest({});
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('orderId');
  });

  it('should return 404 when order not found', async () => {
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }));

    const request = createGetRequest({ orderId: 'order-unknown' });
    const response = await GET(request);

    expect(response.status).toBe(404);
  });

  it('should return 502 on carrier API error', async () => {
    const { ShippingProviderError } = await import(
      '@/lib/shipping/providers/types'
    );
    mockGetAllRates.mockRejectedValue(
      new ShippingProviderError('Rates unavailable', 'RATE_ERROR', 'israel_post', false)
    );

    const request = createGetRequest({ orderId: 'order-123' });
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain('שגיאה בשירות השילוח');
  });

  it('should return 401 when not authenticated', async () => {
    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: false,
      error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }),
    });

    const request = createGetRequest({ orderId: 'order-123' });
    const response = await GET(request);

    expect(response.status).toBe(401);
  });
});
