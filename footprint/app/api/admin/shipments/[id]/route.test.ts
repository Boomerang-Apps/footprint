/**
 * Shipment by ID API Tests - INT-07
 *
 * Tests for GET single shipment and DELETE cancel shipment (AC-012)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, DELETE } from './route';

// Mock Supabase
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

const mockCancelShipment = vi.fn();

vi.mock('@/lib/shipping/providers/shipping-service', () => ({
  getDefaultShippingService: vi.fn(() => ({
    cancelShipment: mockCancelShipment,
  })),
}));

const mockShipment = {
  id: 'shipment-1',
  order_id: 'order-123',
  shipment_id: 'ISP-12345',
  tracking_number: 'RR123456789IL',
  carrier: 'israel_post',
  status: 'created',
  label_url: 'https://example.com/label.pdf',
};

function createContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('GET /api/admin/shipments/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', user_metadata: { role: 'admin' } } },
      error: null,
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
        };
      }
      return {};
    });
  });

  it('should return shipment details', async () => {
    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1');
    const response = await GET(request, createContext('shipment-1'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.shipment.tracking_number).toBe('RR123456789IL');
  });

  it('should return 404 for non-existent shipment', async () => {
    mockFrom.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }));

    const request = new NextRequest('http://localhost/api/admin/shipments/unknown');
    const response = await GET(request, createContext('unknown'));
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('משלוח לא נמצא');
  });

  it('should return 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not auth' },
    });

    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1');
    const response = await GET(request, createContext('shipment-1'));

    expect(response.status).toBe(401);
  });
});

describe('DELETE /api/admin/shipments/[id] (AC-012)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', user_metadata: { role: 'admin' } } },
      error: null,
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
      if (table === 'admin_audit_log') {
        return {
          insert: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return {};
    });

    mockCancelShipment.mockResolvedValue(true);
  });

  it('should cancel shipment successfully', async () => {
    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, createContext('shipment-1'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.carrierCancelled).toBe(true);
  });

  it('should return 404 for non-existent shipment', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'shipments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const request = new NextRequest('http://localhost/api/admin/shipments/unknown', {
      method: 'DELETE',
    });
    const response = await DELETE(request, createContext('unknown'));

    expect(response.status).toBe(404);
  });

  it('should reject cancelling delivered shipment', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'shipments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockShipment, status: 'delivered' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, createContext('shipment-1'));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('לא ניתן לבטל');
  });

  it('should handle carrier cancel failure gracefully', async () => {
    mockCancelShipment.mockResolvedValue(false);

    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1', {
      method: 'DELETE',
    });
    const response = await DELETE(request, createContext('shipment-1'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.carrierCancelled).toBe(false);
  });
});
