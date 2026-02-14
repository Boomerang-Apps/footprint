/**
 * Retry Shipment API Tests - INT-07 AC-011
 *
 * Tests for PATCH /api/admin/shipments/[id]/retry
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH } from './route';

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

const mockCreateShipment = vi.fn();

vi.mock('@/lib/shipping/providers/shipping-service', () => ({
  getDefaultShippingService: vi.fn(() => ({
    createShipment: mockCreateShipment,
  })),
}));

const mockFailedShipment = {
  id: 'shipment-1',
  order_id: 'order-123',
  shipment_id: null,
  tracking_number: null,
  carrier: 'israel_post',
  status: 'failed',
  service_type: 'registered',
  retry_count: 1,
  last_error: 'Previous error',
};

const mockOrder = {
  id: 'order-123',
  order_number: 'FP-2026-001',
  total: 250,
  shipping_address: {
    name: 'Customer',
    street: 'Herzl 50',
    city: 'Haifa',
    postalCode: '3303500',
    country: 'Israel',
    phone: '052-1234567',
  },
};

function createContext(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('PATCH /api/admin/shipments/[id]/retry (AC-011)', () => {
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
                data: mockFailedShipment,
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }
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

    mockCreateShipment.mockResolvedValue({
      success: true,
      shipmentId: 'ISP-99999',
      trackingNumber: 'RR999999999IL',
      carrier: 'israel_post',
      labelUrl: 'https://example.com/label.pdf',
    });
  });

  it('should retry failed shipment successfully', async () => {
    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1/retry', {
      method: 'PATCH',
    });
    const response = await PATCH(request, createContext('shipment-1'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.trackingNumber).toBe('RR999999999IL');
  });

  it('should reject retry on non-failed shipment', async () => {
    mockFrom.mockImplementation((table: string) => {
      if (table === 'shipments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockFailedShipment, status: 'created' },
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1/retry', {
      method: 'PATCH',
    });
    const response = await PATCH(request, createContext('shipment-1'));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('נכשלו');
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

    const request = new NextRequest('http://localhost/api/admin/shipments/unknown/retry', {
      method: 'PATCH',
    });
    const response = await PATCH(request, createContext('unknown'));

    expect(response.status).toBe(404);
  });

  it('should return 502 on carrier error during retry', async () => {
    const { ShippingProviderError } = await import(
      '@/lib/shipping/providers/types'
    );
    mockCreateShipment.mockRejectedValue(
      new ShippingProviderError('Still unavailable', 'PROVIDER_DOWN', 'israel_post', true)
    );

    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1/retry', {
      method: 'PATCH',
    });
    const response = await PATCH(request, createContext('shipment-1'));
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain('שגיאה בשירות השילוח');
  });

  it('should return 401 when not authenticated', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not auth' },
    });

    const request = new NextRequest('http://localhost/api/admin/shipments/shipment-1/retry', {
      method: 'PATCH',
    });
    const response = await PATCH(request, createContext('shipment-1'));

    expect(response.status).toBe(401);
  });
});
