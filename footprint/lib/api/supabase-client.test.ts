import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseClient } from './supabase-client';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('supabaseClient', () => {
  describe('auth', () => {
    it('login throws directing to use Supabase auth', async () => {
      await expect(supabaseClient.auth.login({ email: 'a@b.com', password: 'x' })).rejects.toThrow('Use Supabase auth directly');
    });

    it('register throws directing to use Supabase auth', async () => {
      await expect(supabaseClient.auth.register({ email: 'a@b.com', password: 'x', name: 'Test' })).rejects.toThrow('Use Supabase auth directly');
    });

    it('logout throws directing to use Supabase auth', async () => {
      await expect(supabaseClient.auth.logout()).rejects.toThrow('Use Supabase auth directly');
    });

    it('getSession returns null', async () => {
      expect(await supabaseClient.auth.getSession()).toBeNull();
    });

    it('resetPassword throws directing to use Supabase auth', async () => {
      await expect(supabaseClient.auth.resetPassword('a@b.com')).rejects.toThrow('Use Supabase auth directly');
    });
  });

  describe('orders', () => {
    it('create calls POST /api/orders', async () => {
      const order = { id: 'o1', status: 'pending' };
      mockFetch.mockResolvedValueOnce(mockResponse(order));

      const input = { items: [], shippingAddress: { name: '', street: '', city: '', postalCode: '', country: '' } };
      const result = await supabaseClient.orders.create(input as any);

      expect(mockFetch).toHaveBeenCalledWith('/api/orders', expect.objectContaining({ method: 'POST' }));
      expect(result).toEqual(order);
    });

    it('get calls GET /api/orders/:id', async () => {
      const order = { id: 'o1' };
      mockFetch.mockResolvedValueOnce(mockResponse(order));

      const result = await supabaseClient.orders.get('o1');
      expect(mockFetch).toHaveBeenCalledWith('/api/orders/o1', expect.anything());
      expect(result).toEqual(order);
    });

    it('list maps API response to Order array', async () => {
      const apiResponse = {
        orders: [
          {
            id: 'o1',
            orderNumber: 'FP-001',
            status: 'pending',
            total: 12900,
            itemCount: 1,
            createdAt: '2025-01-01T00:00:00Z',
            trackingNumber: null,
            carrier: null,
            items: [
              {
                id: 'i1',
                originalImageUrl: 'https://example.com/img.jpg',
                transformedImageUrl: null,
                style: 'watercolor',
                size: 'A4',
                frameType: 'black',
              },
            ],
          },
        ],
        total: 1,
      };
      mockFetch.mockResolvedValueOnce(mockResponse(apiResponse));

      const result = await supabaseClient.orders.list();
      expect(result).toHaveLength(1);
      expect(result[0].total).toBe(129); // converts agorot to shekels
      expect(result[0].orderNumber).toBe('FP-001');
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].style).toBe('watercolor');
    });

    it('updateStatus calls PATCH /api/admin/orders/:id/status', async () => {
      const order = { id: 'o1', status: 'shipped' };
      mockFetch.mockResolvedValueOnce(mockResponse(order));

      const result = await supabaseClient.orders.updateStatus('o1', 'shipped' as any);
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/orders/o1/status', expect.objectContaining({ method: 'PATCH' }));
      expect(result).toEqual(order);
    });

    it('addTracking calls PATCH /api/admin/orders/:id/tracking', async () => {
      const order = { id: 'o1', trackingNumber: 'TN123' };
      mockFetch.mockResolvedValueOnce(mockResponse(order));

      const result = await supabaseClient.orders.addTracking('o1', 'TN123', 'Israel Post');
      expect(mockFetch).toHaveBeenCalledWith('/api/admin/orders/o1/tracking', expect.objectContaining({ method: 'PATCH' }));
      expect(result).toEqual(order);
    });
  });

  describe('products', () => {
    it('getStyles returns empty array', async () => {
      expect(await supabaseClient.products.getStyles()).toEqual([]);
    });

    it('getSizes returns empty array', async () => {
      expect(await supabaseClient.products.getSizes()).toEqual([]);
    });

    it('getPapers returns empty array', async () => {
      expect(await supabaseClient.products.getPapers()).toEqual([]);
    });

    it('getFrames returns empty array', async () => {
      expect(await supabaseClient.products.getFrames()).toEqual([]);
    });

    it('calculatePrice returns zero breakdown', async () => {
      const result = await supabaseClient.products.calculatePrice({ size: 'A4', paperType: 'matte', frameType: 'none' } as any);
      expect(result.total).toBe(0);
      expect(result.basePrice).toBe(0);
    });
  });

  describe('users', () => {
    it('get calls GET /api/profile', async () => {
      const user = { id: 'u1', name: 'Test' };
      mockFetch.mockResolvedValueOnce(mockResponse(user));

      const result = await supabaseClient.users.get('u1');
      expect(mockFetch).toHaveBeenCalledWith('/api/profile', expect.anything());
      expect(result).toEqual(user);
    });

    it('update calls PUT /api/profile', async () => {
      const user = { id: 'u1', name: 'Updated' };
      mockFetch.mockResolvedValueOnce(mockResponse(user));

      const result = await supabaseClient.users.update('u1', { name: 'Updated' } as any);
      expect(mockFetch).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'PUT' }));
      expect(result).toEqual(user);
    });

    it('getAddresses calls GET /api/addresses', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse([]));

      const result = await supabaseClient.users.getAddresses('u1');
      expect(mockFetch).toHaveBeenCalledWith('/api/addresses', expect.anything());
      expect(result).toEqual([]);
    });

    it('addAddress calls POST /api/addresses', async () => {
      const address = { id: 'a1', street: '123 Main St' };
      mockFetch.mockResolvedValueOnce(mockResponse(address));

      const result = await supabaseClient.users.addAddress('u1', { street: '123 Main St' } as any);
      expect(mockFetch).toHaveBeenCalledWith('/api/addresses', expect.objectContaining({ method: 'POST' }));
      expect(result).toEqual(address);
    });
  });

  describe('apiFetch error handling', () => {
    it('throws on non-ok response with error message', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Not found' }, false, 404));

      await expect(supabaseClient.orders.get('x')).rejects.toThrow('Not found');
    });

    it('throws generic error when response JSON parse fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('parse error')),
      });

      await expect(supabaseClient.orders.get('x')).rejects.toThrow('Unknown error');
    });
  });
});
