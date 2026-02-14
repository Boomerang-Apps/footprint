/**
 * Admin Order Detail API Tests
 *
 * Tests for GET /api/admin/orders/[id] - Fetch single order with details
 */

import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock verifyAdmin
const mockVerifyAdmin = vi.fn();
vi.mock('@/lib/auth/admin', () => ({
  verifyAdmin: () => mockVerifyAdmin(),
}));

// Mock Supabase
const mockSingle = vi.fn();
const mockEqOrders = vi.fn(() => ({ single: mockSingle }));
const mockSelectOrders = vi.fn(() => ({ eq: mockEqOrders }));

const mockEqItems = vi.fn();
const mockSelectItems = vi.fn(() => ({ eq: mockEqItems }));

const mockOrderShipments = vi.fn();
const mockEqShipments = vi.fn(() => ({ order: mockOrderShipments }));
const mockSelectShipments = vi.fn(() => ({ eq: mockEqShipments }));

let fromCallCount = 0;
const mockFrom = vi.fn(() => {
  fromCallCount++;
  if (fromCallCount === 1) return { select: mockSelectOrders };
  if (fromCallCount === 2) return { select: mockSelectItems };
  return { select: mockSelectShipments };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      from: mockFrom,
    })
  ),
}));

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve(null)),
}));

import { GET } from './route';

// Test data
const mockOrder = {
  id: 'order-1',
  order_number: 'FP-2024-001',
  status: 'pending',
  fulfillment_status: 'processing',
  payment_status: 'paid',
  total: 23700,
  subtotal: 22900,
  shipping_cost: 2500,
  discount_amount: 1700,
  discount_code: 'SAVE10',
  customer_email: 'customer@example.com',
  customer_name: 'Test Customer',
  customer_phone: '050-1234567',
  user_id: 'cust-1',
  shipping_address: { city: 'Tel Aviv', street: 'Dizengoff 1' },
  is_gift: true,
  gift_message: 'Happy birthday!',
  notes: 'Handle with care',
  tracking_number: 'IL123456789',
  created_at: '2024-12-25T10:00:00Z',
  updated_at: '2024-12-26T10:00:00Z',
  paid_at: '2024-12-25T10:05:00Z',
  shipped_at: '2024-12-26T08:00:00Z',
  delivered_at: null,
};

const mockItems = [
  {
    id: 'item-1',
    product_name: 'הדפס צבעי מים',
    style_name: 'watercolor',
    size: 'A4',
    paper_type: 'matte',
    frame_type: 'black',
    quantity: 1,
    price: 22900,
    print_file_url: 'https://r2.example.com/print.jpg',
    thumbnail_url: 'https://r2.example.com/thumb.jpg',
    original_image_url: 'https://r2.example.com/original.jpg',
    transformed_image_url: 'https://r2.example.com/transformed.jpg',
  },
];

const mockShipments = [
  {
    id: 'ship-1',
    tracking_number: 'IL123456789',
    carrier: 'Israel Post',
    status: 'in_transit',
    label_url: 'https://example.com/label.pdf',
    created_at: '2024-12-26T08:00:00Z',
  },
];

function createRequest(orderId: string): [NextRequest, { params: Promise<{ id: string }> }] {
  const request = new NextRequest(`http://localhost:3000/api/admin/orders/${orderId}`);
  return [request, { params: Promise.resolve({ id: orderId }) }];
}

describe('GET /api/admin/orders/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fromCallCount = 0;
    mockVerifyAdmin.mockResolvedValue({
      isAuthorized: true,
      user: { id: 'admin-id', email: 'admin@footprint.co.il', role: 'admin' },
    });
  });

  describe('Authentication & Authorization', () => {
    it('returns 401 when not authenticated', async () => {
      mockVerifyAdmin.mockResolvedValue({
        isAuthorized: false,
        error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }),
      });

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('נדרשת הזדהות');
    });

    it('returns 401 when auth error occurs', async () => {
      mockVerifyAdmin.mockResolvedValue({
        isAuthorized: false,
        error: NextResponse.json({ error: 'נדרשת הזדהות' }, { status: 401 }),
      });

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);

      expect(response.status).toBe(401);
    });

    it('returns 403 for non-admin users', async () => {
      mockVerifyAdmin.mockResolvedValue({
        isAuthorized: false,
        error: NextResponse.json({ error: 'נדרשת הרשאת מנהל' }, { status: 403 }),
      });

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error).toBe('נדרשת הרשאת מנהל');
    });
  });

  describe('Successful Order Fetch', () => {
    it('returns order with items and shipments', async () => {
      mockSingle.mockResolvedValue({ data: mockOrder, error: null });
      mockEqItems.mockResolvedValue({ data: mockItems, error: null });
      mockOrderShipments.mockResolvedValue({ data: mockShipments, error: null });

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.id).toBe('order-1');
      expect(body.orderNumber).toBe('FP-2024-001');
      expect(body.status).toBe('processing');
      expect(body.paymentStatus).toBe('paid');
      expect(body.total).toBe(23700);
      expect(body.subtotal).toBe(22900);
      expect(body.shippingCost).toBe(2500);
      expect(body.discountAmount).toBe(1700);
      expect(body.discountCode).toBe('SAVE10');
      expect(body.itemCount).toBe(1);
      expect(body.items).toHaveLength(1);
      expect(body.items[0].productName).toBe('הדפס צבעי מים');
      expect(body.items[0].styleName).toBe('watercolor');
      expect(body.items[0].size).toBe('A4');
      expect(body.shipments).toHaveLength(1);
      expect(body.shipments[0].trackingNumber).toBe('IL123456789');
      expect(body.shipments[0].carrier).toBe('Israel Post');
      expect(body.customerEmail).toBe('customer@example.com');
      expect(body.customerName).toBe('Test Customer');
      expect(body.isGift).toBe(true);
      expect(body.giftMessage).toBe('Happy birthday!');
      expect(body.trackingNumber).toBe('IL123456789');
    });

    it('uses camelCase property names in response', async () => {
      mockSingle.mockResolvedValue({ data: mockOrder, error: null });
      mockEqItems.mockResolvedValue({ data: mockItems, error: null });
      mockOrderShipments.mockResolvedValue({ data: mockShipments, error: null });

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);
      const body = await response.json();

      // Should have camelCase, not snake_case
      expect(body).toHaveProperty('orderNumber');
      expect(body).toHaveProperty('paymentStatus');
      expect(body).toHaveProperty('shippingCost');
      expect(body).toHaveProperty('discountAmount');
      expect(body).toHaveProperty('customerEmail');
      expect(body).toHaveProperty('customerName');
      expect(body).toHaveProperty('shippingAddress');
      expect(body).toHaveProperty('createdAt');
      expect(body).toHaveProperty('updatedAt');
      expect(body).not.toHaveProperty('order_number');
      expect(body).not.toHaveProperty('payment_status');
    });

    it('handles order with no items or shipments', async () => {
      mockSingle.mockResolvedValue({ data: mockOrder, error: null });
      mockEqItems.mockResolvedValue({ data: null, error: null });
      mockOrderShipments.mockResolvedValue({ data: null, error: null });

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.items).toEqual([]);
      expect(body.itemCount).toBe(0);
      expect(body.shipments).toEqual([]);
    });

    it('applies default values for nullable fields', async () => {
      const orderWithNulls = {
        ...mockOrder,
        fulfillment_status: null,
        payment_status: null,
        subtotal: null,
        shipping_cost: null,
        discount_amount: null,
        is_gift: null,
      };
      mockSingle.mockResolvedValue({ data: orderWithNulls, error: null });
      mockEqItems.mockResolvedValue({ data: [], error: null });
      mockOrderShipments.mockResolvedValue({ data: [], error: null });

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.status).toBe('pending'); // falls back to order.status
      expect(body.paymentStatus).toBe('pending');
      expect(body.subtotal).toBe(23700); // falls back to total
      expect(body.shippingCost).toBe(0);
      expect(body.discountAmount).toBe(0);
      expect(body.isGift).toBe(false);
    });

    it('applies default names for items without names', async () => {
      const itemWithNulls = [
        {
          ...mockItems[0],
          product_name: null,
          style_name: null,
        },
      ];
      mockSingle.mockResolvedValue({ data: mockOrder, error: null });
      mockEqItems.mockResolvedValue({ data: itemWithNulls, error: null });
      mockOrderShipments.mockResolvedValue({ data: [], error: null });

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);
      const body = await response.json();

      expect(body.items[0].productName).toBe('הדפס אמנותי');
      expect(body.items[0].styleName).toBe('מקורי');
    });
  });

  describe('Error Handling', () => {
    it('returns 404 when order not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' },
      });

      const [req, ctx] = createRequest('nonexistent');
      const response = await GET(req, ctx);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toContain('Order not found');
    });

    it('returns 500 on database error', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'OTHER', message: 'Database connection failed' },
      });

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('Failed to fetch order');
    });

    it('continues when items query fails', async () => {
      mockSingle.mockResolvedValue({ data: mockOrder, error: null });
      mockEqItems.mockResolvedValue({ data: null, error: { message: 'Items query failed' } });
      mockOrderShipments.mockResolvedValue({ data: mockShipments, error: null });

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.items).toEqual([]);
      expect(body.shipments).toHaveLength(1);
    });

    it('continues when shipments query fails', async () => {
      mockSingle.mockResolvedValue({ data: mockOrder, error: null });
      mockEqItems.mockResolvedValue({ data: mockItems, error: null });
      mockOrderShipments.mockResolvedValue({ data: null, error: { message: 'Shipments query failed' } });

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.items).toHaveLength(1);
      expect(body.shipments).toEqual([]);
    });

    it('returns 500 on unexpected error', async () => {
      mockSingle.mockRejectedValue(new Error('Unexpected error'));

      const [req, ctx] = createRequest('order-1');
      const response = await GET(req, ctx);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toContain('Failed to fetch order');
    });
  });

  describe('Database Queries', () => {
    beforeEach(() => {
      mockSingle.mockResolvedValue({ data: mockOrder, error: null });
      mockEqItems.mockResolvedValue({ data: mockItems, error: null });
      mockOrderShipments.mockResolvedValue({ data: mockShipments, error: null });
    });

    it('queries orders table with correct id', async () => {
      const [req, ctx] = createRequest('test-order-id');
      await GET(req, ctx);

      expect(mockFrom).toHaveBeenCalledWith('orders');
      expect(mockEqOrders).toHaveBeenCalledWith('id', 'test-order-id');
    });

    it('queries order_items by order_id', async () => {
      const [req, ctx] = createRequest('test-order-id');
      await GET(req, ctx);

      expect(mockFrom).toHaveBeenCalledWith('order_items');
      expect(mockEqItems).toHaveBeenCalledWith('order_id', 'test-order-id');
    });

    it('queries shipments by order_id with descending order', async () => {
      const [req, ctx] = createRequest('test-order-id');
      await GET(req, ctx);

      expect(mockFrom).toHaveBeenCalledWith('shipments');
      expect(mockEqShipments).toHaveBeenCalledWith('order_id', 'test-order-id');
      expect(mockOrderShipments).toHaveBeenCalledWith('created_at', { ascending: false });
    });
  });
});
