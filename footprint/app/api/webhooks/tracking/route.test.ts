/**
 * Tracking Webhook Tests - INT-07
 *
 * Tests for receiving tracking updates from shipping providers
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

// Mock Supabase
const mockUpdate = vi.fn();
const mockSingleResult = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: vi.fn((table: string) => {
        if (table === 'shipments') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: mockSingleResult,
              }),
            }),
            update: mockUpdate,
          };
        }
        if (table === 'orders') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          };
        }
        return {};
      }),
    })
  ),
}));

// Mock crypto for signature verification - need to handle timingSafeEqual
vi.mock('crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('crypto')>();
  return {
    ...actual,
    default: {
      ...actual,
      createHmac: vi.fn(() => ({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn(() => 'valid-signature'),
      })),
      timingSafeEqual: vi.fn((a: Buffer, b: Buffer) => {
        return a.toString() === b.toString();
      }),
    },
  };
});

function createRequest(
  body: object,
  signature = 'valid-signature'
): NextRequest {
  return new NextRequest('http://localhost/api/webhooks/tracking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Provider': 'israel_post',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/webhooks/tracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ISRAEL_POST_WEBHOOK_SECRET', 'test-webhook-secret');

    // Default: shipment found and update succeeds
    mockSingleResult.mockResolvedValue({
      data: {
        id: 'shipment-1',
        tracking_number: 'RR123456789IL',
        order_id: 'order-123',
        status: 'in_transit',
        tracking_events: [],
      },
      error: null,
    });

    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
  });

  describe('Signature Verification', () => {
    it('should return 401 for missing signature', async () => {
      const request = new NextRequest('http://localhost/api/webhooks/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Provider': 'israel_post',
        },
        body: JSON.stringify({ trackingNumber: 'RR123456789IL' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('signature');
    });

    it('should return 401 for invalid signature', async () => {
      const request = createRequest(
        { trackingNumber: 'RR123456789IL', status: 'DELIVERED' },
        'wrong-signature'
      );

      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it('should accept valid signature', async () => {
      const request = createRequest({
        trackingNumber: 'RR123456789IL',
        status: 'DELIVERED',
        timestamp: '2026-01-15T10:30:00Z',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Tracking Update', () => {
    it('should update shipment status', async () => {
      const request = createRequest({
        trackingNumber: 'RR123456789IL',
        status: 'DELIVERED',
        timestamp: '2026-01-15T10:30:00Z',
        location: 'Haifa',
        description: 'Delivered to recipient',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.status).toBe('delivered');
    });

    it('should return 404 for unknown tracking number', async () => {
      mockSingleResult.mockResolvedValue({ data: null, error: null });

      const request = createRequest({
        trackingNumber: 'UNKNOWN123',
        status: 'DELIVERED',
        timestamp: '2026-01-15T10:30:00Z',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('not found');
    });

    it('should handle database fetch error', async () => {
      mockSingleResult.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const request = createRequest({
        trackingNumber: 'RR123456789IL',
        status: 'DELIVERED',
        timestamp: '2026-01-15T10:30:00Z',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe('Status Mapping', () => {
    it('should map DELIVERED to delivered', async () => {
      const request = createRequest({
        trackingNumber: 'RR123456789IL',
        status: 'DELIVERED',
        timestamp: '2026-01-15T10:30:00Z',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.status).toBe('delivered');
    });

    it('should map IN_TRANSIT to in_transit', async () => {
      const request = createRequest({
        trackingNumber: 'RR123456789IL',
        status: 'IN_TRANSIT',
        timestamp: '2026-01-15T10:30:00Z',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.status).toBe('in_transit');
    });

    it('should map OUT_FOR_DELIVERY to out_for_delivery', async () => {
      const request = createRequest({
        trackingNumber: 'RR123456789IL',
        status: 'OUT_FOR_DELIVERY',
        timestamp: '2026-01-15T10:30:00Z',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.status).toBe('out_for_delivery');
    });
  });

  describe('Response', () => {
    it('should return shipment ID in response', async () => {
      const request = createRequest({
        trackingNumber: 'RR123456789IL',
        status: 'IN_TRANSIT',
        timestamp: '2026-01-15T10:30:00Z',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.shipmentId).toBe('shipment-1');
    });

    it('should return event count', async () => {
      mockSingleResult.mockResolvedValue({
        data: {
          id: 'shipment-1',
          tracking_number: 'RR123456789IL',
          order_id: 'order-123',
          status: 'in_transit',
          tracking_events: [{ status: 'picked_up' }],
        },
        error: null,
      });

      const request = createRequest({
        trackingNumber: 'RR123456789IL',
        status: 'IN_TRANSIT',
        timestamp: '2026-01-15T10:30:00Z',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.eventCount).toBe(2); // existing + new
    });
  });
});
