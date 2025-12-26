/**
 * Order Creation Service - TDD Tests
 *
 * Tests for creating orders from successful payments.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Import the module we're going to implement
import {
  type CreateOrderParams,
  type CreateOrderResult,
  type OrderItem,
  type ShippingAddress,
  createOrder,
  generateOrderNumber,
  triggerConfirmationEmail,
} from './create';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';

// Helper to create valid order params
function createValidOrderParams(
  overrides: Partial<CreateOrderParams> = {}
): CreateOrderParams {
  return {
    userId: 'user-123',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [
      {
        name: 'Pop Art Print - A4',
        quantity: 1,
        price: 149,
        imageUrl: 'https://r2.footprint.co.il/transformed/abc.jpg',
        style: 'pop_art',
        size: 'A4',
        paper: 'matte',
        frame: 'none',
      },
    ],
    subtotal: 149,
    shipping: 25,
    total: 174,
    shippingAddress: {
      street: '123 Main St',
      city: 'Tel Aviv',
      postalCode: '6100000',
      country: 'Israel',
    },
    paymentProvider: 'stripe',
    paymentTransactionId: 'pi_test_123',
    ...overrides,
  };
}

// Helper to create mock Supabase client
function createMockSupabase() {
  const mockSingle = vi.fn();

  // Create a chainable mock that returns itself for most methods
  const createChainableMock = () => {
    const chainable: Record<string, ReturnType<typeof vi.fn>> = {};

    chainable.select = vi.fn().mockReturnValue(chainable);
    chainable.insert = vi.fn().mockReturnValue(chainable);
    chainable.eq = vi.fn().mockReturnValue(chainable);
    chainable.like = vi.fn().mockReturnValue(chainable);
    chainable.order = vi.fn().mockReturnValue(chainable);
    chainable.limit = vi.fn().mockReturnValue(chainable);
    chainable.single = mockSingle;

    return chainable;
  };

  const chainable = createChainableMock();
  const mockFrom = vi.fn().mockReturnValue(chainable);

  return {
    mockFrom,
    mockSelect: chainable.select,
    mockInsert: chainable.insert,
    mockSingle,
    mockEq: chainable.eq,
    mockLike: chainable.like,
    mockOrder: chainable.order,
    mockLimit: chainable.limit,
    client: { from: mockFrom },
  };
}

describe('Order Creation Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('generateOrderNumber', () => {
    it('should generate order number in FP-YYYYMMDD-XXXX format', async () => {
      const mockSupabase = createMockSupabase();
      mockSupabase.mockSingle.mockResolvedValue({
        data: null,
        error: null,
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase.client as never);

      const orderNumber = await generateOrderNumber(new Date('2025-12-26'));

      expect(orderNumber).toMatch(/^FP-20251226-\d{4}$/);
    });

    it('should generate sequential numbers for same day', async () => {
      const mockSupabase = createMockSupabase();

      // First call returns the last order for today
      mockSupabase.mockSingle.mockResolvedValueOnce({
        data: { order_number: 'FP-20251226-0005' },
        error: null,
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase.client as never);

      const orderNumber = await generateOrderNumber(new Date('2025-12-26'));

      expect(orderNumber).toBe('FP-20251226-0006');
    });

    it('should start from 0001 for new day', async () => {
      const mockSupabase = createMockSupabase();
      mockSupabase.mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase.client as never);

      const orderNumber = await generateOrderNumber(new Date('2025-12-26'));

      expect(orderNumber).toBe('FP-20251226-0001');
    });

    it('should zero-pad sequence number to 4 digits', async () => {
      const mockSupabase = createMockSupabase();
      mockSupabase.mockSingle.mockResolvedValue({
        data: { order_number: 'FP-20251226-0099' },
        error: null,
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase.client as never);

      const orderNumber = await generateOrderNumber(new Date('2025-12-26'));

      expect(orderNumber).toBe('FP-20251226-0100');
    });
  });

  describe('createOrder', () => {
    it('should create order with all required fields', async () => {
      const mockSupabase = createMockSupabase();
      const params = createValidOrderParams();

      // Mock 1: Idempotency check - no existing order
      mockSupabase.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Mock 2: Order number generation - no existing orders today
      mockSupabase.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Mock 3: Insert order
      mockSupabase.mockSingle.mockResolvedValueOnce({
        data: { id: 'order-456', order_number: 'FP-20251226-0001' },
        error: null,
      });

      vi.mocked(createClient).mockResolvedValue(mockSupabase.client as never);

      const result = await createOrder(params);

      expect(result.orderId).toBe('order-456');
      expect(result.orderNumber).toBe('FP-20251226-0001');
    });

    it('should throw error if customerName is missing', async () => {
      const params = createValidOrderParams({ customerName: '' });

      await expect(createOrder(params)).rejects.toThrow('Customer name is required');
    });

    it('should throw error if customerEmail is missing', async () => {
      const params = createValidOrderParams({ customerEmail: '' });

      await expect(createOrder(params)).rejects.toThrow('Customer email is required');
    });

    it('should throw error if items is empty', async () => {
      const params = createValidOrderParams({ items: [] });

      await expect(createOrder(params)).rejects.toThrow('At least one item is required');
    });

    it('should throw error if total is zero or negative', async () => {
      const params = createValidOrderParams({ total: 0 });

      await expect(createOrder(params)).rejects.toThrow('Total must be greater than 0');
    });

    it('should throw error if paymentTransactionId is missing', async () => {
      const params = createValidOrderParams({ paymentTransactionId: '' });

      await expect(createOrder(params)).rejects.toThrow('Payment transaction ID is required');
    });

    it('should handle idempotency - return existing order for duplicate transaction', async () => {
      const mockSupabase = createMockSupabase();
      const params = createValidOrderParams();

      // Mock finding existing order by transaction ID
      mockSupabase.mockSingle.mockResolvedValueOnce({
        data: { id: 'existing-order', order_number: 'FP-20251226-0001' },
        error: null,
      });

      vi.mocked(createClient).mockResolvedValue(mockSupabase.client as never);

      const result = await createOrder(params);

      expect(result.orderId).toBe('existing-order');
      expect(result.orderNumber).toBe('FP-20251226-0001');
    });

    it('should store gift information when provided', async () => {
      const mockSupabase = createMockSupabase();
      const params = createValidOrderParams({
        isGift: true,
        giftMessage: 'Happy Birthday!',
      });

      // Mock order number generation
      mockSupabase.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Mock idempotency check - no existing order
      mockSupabase.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Mock insert
      mockSupabase.mockSingle.mockResolvedValueOnce({
        data: { id: 'gift-order', order_number: 'FP-20251226-0001' },
        error: null,
      });

      vi.mocked(createClient).mockResolvedValue(mockSupabase.client as never);

      const result = await createOrder(params);

      expect(result.orderId).toBe('gift-order');
      expect(mockSupabase.mockInsert).toHaveBeenCalled();
    });

    it('should throw error if database insert fails', async () => {
      const mockSupabase = createMockSupabase();
      const params = createValidOrderParams();

      // Mock order number generation
      mockSupabase.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Mock idempotency check
      mockSupabase.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Mock insert failure
      mockSupabase.mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' },
      });

      vi.mocked(createClient).mockResolvedValue(mockSupabase.client as never);

      await expect(createOrder(params)).rejects.toThrow('Failed to create order');
    });
  });

  describe('triggerConfirmationEmail', () => {
    it('should call confirmation endpoint', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, emailId: 'email-123' }),
      });
      global.fetch = mockFetch;

      await triggerConfirmationEmail('order-123');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/orders/order-123/confirm'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should not throw if email fails (fire and forget)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Email service down' }),
      });
      global.fetch = mockFetch;

      // Should not throw
      await expect(triggerConfirmationEmail('order-123')).resolves.not.toThrow();
    });

    it('should log error if email fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Email service down' }),
      });
      global.fetch = mockFetch;

      await triggerConfirmationEmail('order-123');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('OrderItem interface', () => {
    it('should require name, quantity, and price', () => {
      const item: OrderItem = {
        name: 'Test Print',
        quantity: 1,
        price: 100,
      };

      expect(item.name).toBe('Test Print');
      expect(item.quantity).toBe(1);
      expect(item.price).toBe(100);
    });

    it('should allow optional style, size, paper, frame fields', () => {
      const item: OrderItem = {
        name: 'Test Print',
        quantity: 1,
        price: 100,
        style: 'pop_art',
        size: 'A4',
        paper: 'matte',
        frame: 'black',
        imageUrl: 'https://example.com/image.jpg',
      };

      expect(item.style).toBe('pop_art');
      expect(item.size).toBe('A4');
    });
  });

  describe('ShippingAddress interface', () => {
    it('should require street, city, postalCode, country', () => {
      const address: ShippingAddress = {
        street: '123 Main St',
        city: 'Tel Aviv',
        postalCode: '6100000',
        country: 'Israel',
      };

      expect(address.street).toBe('123 Main St');
      expect(address.city).toBe('Tel Aviv');
      expect(address.postalCode).toBe('6100000');
      expect(address.country).toBe('Israel');
    });
  });
});
