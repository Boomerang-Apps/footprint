/**
 * Tests for Order Details API
 * GET /api/orders/[id] - Get full order details including items and tracking
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

// Helper to create mock request with params
function createRequest(url: string = 'http://localhost:3000/api/orders/123'): NextRequest {
  return new NextRequest(new Request(url));
}

// Helper to create params object
function createParams(orderId: string) {
  return { params: Promise.resolve({ id: orderId }) };
}

// Valid UUIDs for testing
const VALID_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_ORDER_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_USER_ID = '550e8400-e29b-41d4-a716-446655440002';

// Mock authenticated user
const mockUser = {
  id: VALID_USER_ID,
  email: 'user@example.com',
};

// Mock order with items
const mockOrderWithItems = {
  id: VALID_ORDER_ID,
  user_id: VALID_USER_ID,
  order_number: 'FP-2024-001',
  status: 'shipped',

  // Pricing in agorot (will be converted to ILS)
  subtotal: 12000, // 120.00 ILS
  shipping_cost: 3000, // 30.00 ILS
  discount_amount: 500, // 5.00 ILS
  tax_amount: 2040, // 20.40 ILS
  total: 16540, // 165.40 ILS

  // Gift options
  is_gift: false,
  gift_message: null,
  gift_wrap: false,
  hide_price: false,

  // Addresses
  shipping_address: {
    street: '123 Main St',
    city: 'Tel Aviv',
    postalCode: '12345',
    country: 'Israel',
  },
  billing_address: {
    street: '123 Main St',
    city: 'Tel Aviv',
    postalCode: '12345',
    country: 'Israel',
  },

  // Tracking
  tracking_number: 'RR123456789IL',
  carrier: 'israel_post',

  // Timestamps
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T12:00:00Z',
  paid_at: '2024-01-15T10:30:00Z',
  shipped_at: '2024-01-16T09:00:00Z',
  delivered_at: null,
  cancelled_at: null,

  // Items
  order_items: [
    {
      id: 'item-1',
      original_image_url: 'https://example.com/image1.jpg',
      transformed_image_url: 'https://example.com/transformed1.jpg',
      print_ready_url: 'https://example.com/print1.jpg',
      style: 'classic',
      size: '20x30',
      paper_type: 'matte',
      frame_type: 'wood',
      quantity: 1,
      base_price: 8000, // 80.00 ILS
      paper_addon: 1000, // 10.00 ILS
      frame_addon: 3000, // 30.00 ILS
      item_total: 12000, // 120.00 ILS
    },
  ],
};

describe('GET /api/orders/[id]', () => {
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
      const params = createParams(VALID_ORDER_ID);
      const response = await GET(request, params);
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
      const params = createParams(VALID_ORDER_ID);
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized - Please sign in');
    });
  });

  describe('Authorization', () => {
    it('should only return user\'s own orders', async () => {
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
              single: vi.fn().mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const params = createParams(VALID_ORDER_ID);
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(VALID_ORDER_ID);
    });

    it('should return 404 for other user\'s order', async () => {
      const otherUserOrder = {
        ...mockOrderWithItems,
        user_id: OTHER_USER_ID, // Different user
      };

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
              single: vi.fn().mockResolvedValue({
                data: otherUserOrder,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const params = createParams(VALID_ORDER_ID);
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Order not found');
    });
  });

  describe('Input Validation', () => {
    it('should validate order ID format', async () => {
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
          }),
        },
      } as any);

      const request = createRequest();
      const params = createParams('invalid-id'); // Not a UUID
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid order ID format');
    });

    it('should accept valid UUID order ID', async () => {
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
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }, // No rows returned
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const request = createRequest();
      const params = createParams(validUuid);
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(404); // Valid format but order not found
      expect(data.error).toBe('Order not found');
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
      const params = createParams('123e4567-e89b-12d3-a456-426614174000');
      const response = await GET(request, params);

      expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith('general', request);
      expect(response.status).toBe(429);
    });
  });

  describe('Success Responses', () => {
    it('should return order detail with correct structure', async () => {
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
              single: vi.fn().mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const params = createParams('123e4567-e89b-12d3-a456-426614174000');
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);

      // Verify main order structure
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('orderNumber');
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('statusLabel');

      // Verify pricing structure (converted from agorot)
      expect(data).toHaveProperty('subtotal');
      expect(data).toHaveProperty('shippingCost');
      expect(data).toHaveProperty('discountAmount');
      expect(data).toHaveProperty('taxAmount');
      expect(data).toHaveProperty('total');

      // Verify gift options
      expect(data).toHaveProperty('isGift');
      expect(data).toHaveProperty('giftMessage');
      expect(data).toHaveProperty('giftWrap');
      expect(data).toHaveProperty('hidePrice');

      // Verify addresses
      expect(data).toHaveProperty('shippingAddress');
      expect(data).toHaveProperty('billingAddress');

      // Verify tracking
      expect(data).toHaveProperty('trackingNumber');
      expect(data).toHaveProperty('trackingUrl');
      expect(data).toHaveProperty('carrier');

      // Verify items
      expect(data).toHaveProperty('items');
      expect(Array.isArray(data.items)).toBe(true);

      // Verify timestamps
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('updatedAt');
      expect(data).toHaveProperty('paidAt');
      expect(data).toHaveProperty('shippedAt');
      expect(data).toHaveProperty('deliveredAt');
      expect(data).toHaveProperty('cancelledAt');
    });

    it('should include tracking URL when tracking number exists', async () => {
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
              single: vi.fn().mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const params = createParams('123e4567-e89b-12d3-a456-426614174000');
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trackingNumber).toBe('RR123456789IL');
      expect(data.trackingUrl).toBe('https://israelpost.co.il/itemtrace?itemcode=RR123456789IL');
      expect(vi.mocked(generateTrackingUrl)).toHaveBeenCalledWith('RR123456789IL', 'israel_post');
    });

    it('should handle orders without tracking', async () => {
      const orderWithoutTracking = {
        ...mockOrderWithItems,
        tracking_number: null,
        carrier: null,
      };

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
              single: vi.fn().mockResolvedValue({
                data: orderWithoutTracking,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const params = createParams('123e4567-e89b-12d3-a456-426614174000');
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trackingNumber).toBeNull();
      expect(data.trackingUrl).toBeNull();
    });

    it('should convert pricing from agorot to ILS', async () => {
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
              single: vi.fn().mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const params = createParams('123e4567-e89b-12d3-a456-426614174000');
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subtotal).toBe(120); // 12000 agorot -> 120.00 ILS
      expect(data.shippingCost).toBe(30); // 3000 agorot -> 30.00 ILS
      expect(data.discountAmount).toBe(5); // 500 agorot -> 5.00 ILS
      expect(data.taxAmount).toBe(20.4); // 2040 agorot -> 20.40 ILS
      expect(data.total).toBe(165.4); // 16540 agorot -> 165.40 ILS

      // Check item pricing conversion
      expect(data.items[0].basePrice).toBe(80); // 8000 agorot -> 80.00 ILS
      expect(data.items[0].paperAddon).toBe(10); // 1000 agorot -> 10.00 ILS
      expect(data.items[0].frameAddon).toBe(30); // 3000 agorot -> 30.00 ILS
      expect(data.items[0].itemTotal).toBe(120); // 12000 agorot -> 120.00 ILS
    });

    it('should include complete item details', async () => {
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
              single: vi.fn().mockResolvedValue({
                data: mockOrderWithItems,
                error: null,
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const params = createParams('123e4567-e89b-12d3-a456-426614174000');
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);

      const item = data.items[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('originalImageUrl');
      expect(item).toHaveProperty('transformedImageUrl');
      expect(item).toHaveProperty('printReadyUrl');
      expect(item).toHaveProperty('style');
      expect(item).toHaveProperty('size');
      expect(item).toHaveProperty('paperType');
      expect(item).toHaveProperty('frameType');
      expect(item).toHaveProperty('quantity');
      expect(item).toHaveProperty('basePrice');
      expect(item).toHaveProperty('paperAddon');
      expect(item).toHaveProperty('frameAddon');
      expect(item).toHaveProperty('itemTotal');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent order', async () => {
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
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' }, // No rows returned
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const params = createParams('123e4567-e89b-12d3-a456-426614174000');
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Order not found');
    });

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
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database connection failed' },
              }),
            })),
          })),
        })),
      };

      vi.mocked(createClient).mockResolvedValue(mockSupabaseClient as any);

      const request = createRequest();
      const params = createParams('123e4567-e89b-12d3-a456-426614174000');
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch order');
    });

    it('should handle unexpected errors gracefully', async () => {
      vi.mocked(createClient).mockRejectedValue(new Error('Unexpected error'));

      const request = createRequest();
      const params = createParams('123e4567-e89b-12d3-a456-426614174000');
      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch order details');
    });
  });
});