import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(data),
  };
}

// We need to set env vars BEFORE importing the module
const ORIGINAL_ENV = process.env;

beforeEach(() => {
  vi.clearAllMocks();
  process.env = {
    ...ORIGINAL_ENV,
    UZERFLOW_API_URL: 'https://api.uzerflow.test',
    UZERFLOW_API_KEY: 'test-api-key-123',
  };
});

afterEach(() => {
  process.env = ORIGINAL_ENV;
});

// Dynamic import to pick up env vars
async function getClient() {
  // Reset module cache to pick up new env
  vi.resetModules();
  const mod = await import('./uzerflow');
  return mod.uzerflowClient;
}

describe('uzerflowClient', () => {
  describe('when not configured', () => {
    it('throws error if env vars are missing', async () => {
      delete process.env.UZERFLOW_API_URL;
      delete process.env.UZERFLOW_API_KEY;

      const client = await getClient();
      await expect(client.auth.login({ email: 'a@b.com', password: 'x' })).rejects.toThrow('Uzerflow is not configured');
    });
  });

  describe('auth', () => {
    it('login calls POST /auth/login', async () => {
      const user = { id: 'u1', email: 'a@b.com' };
      mockFetch.mockResolvedValueOnce(mockResponse(user));

      const client = await getClient();
      const result = await client.auth.login({ email: 'a@b.com', password: 'pass' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key-123',
          }),
        })
      );
      expect(result).toEqual(user);
    });

    it('register calls POST /auth/register', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 'u2' }));

      const client = await getClient();
      await client.auth.register({ email: 'a@b.com', password: 'p', name: 'Test' });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/auth/register',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('logout calls POST /auth/logout', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({}));

      const client = await getClient();
      await client.auth.logout();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/auth/logout',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('getSession returns user or null on error', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 'u1' }));

      const client = await getClient();
      const user = await client.auth.getSession();
      expect(user).toEqual({ id: 'u1' });
    });

    it('getSession returns null when request fails', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ message: 'Unauthorized' }, false, 401));

      const client = await getClient();
      const result = await client.auth.getSession();
      expect(result).toBeNull();
    });

    it('resetPassword calls POST /auth/reset-password', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({}));

      const client = await getClient();
      await client.auth.resetPassword('a@b.com');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/auth/reset-password',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('orders', () => {
    it('create calls POST /orders', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 'o1' }));

      const client = await getClient();
      const result = await client.orders.create({ items: [] } as any);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/orders',
        expect.objectContaining({ method: 'POST' })
      );
      expect(result).toEqual({ id: 'o1' });
    });

    it('get calls GET /orders/:id', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 'o1' }));

      const client = await getClient();
      const result = await client.orders.get('o1');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/orders/o1',
        expect.anything()
      );
      expect(result).toEqual({ id: 'o1' });
    });

    it('list calls GET /orders with optional userId', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse([]));

      const client = await getClient();
      await client.orders.list('user1');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/orders?userId=user1',
        expect.anything()
      );
    });

    it('list calls GET /orders without userId', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse([]));

      const client = await getClient();
      await client.orders.list();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/orders',
        expect.anything()
      );
    });

    it('updateStatus calls PATCH /orders/:id/status', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 'o1', status: 'shipped' }));

      const client = await getClient();
      await client.orders.updateStatus('o1', 'shipped' as any);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/orders/o1/status',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('addTracking calls PATCH /orders/:id/tracking', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 'o1' }));

      const client = await getClient();
      await client.orders.addTracking('o1', 'TN123', 'DHL');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/orders/o1/tracking',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  describe('products', () => {
    it('getStyles calls GET /products/styles', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse([]));
      const client = await getClient();
      await client.products.getStyles();
      expect(mockFetch).toHaveBeenCalledWith('https://api.uzerflow.test/products/styles', expect.anything());
    });

    it('getSizes calls GET /products/sizes', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse([]));
      const client = await getClient();
      await client.products.getSizes();
      expect(mockFetch).toHaveBeenCalledWith('https://api.uzerflow.test/products/sizes', expect.anything());
    });

    it('getPapers calls GET /products/papers', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse([]));
      const client = await getClient();
      await client.products.getPapers();
      expect(mockFetch).toHaveBeenCalledWith('https://api.uzerflow.test/products/papers', expect.anything());
    });

    it('getFrames calls GET /products/frames', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse([]));
      const client = await getClient();
      await client.products.getFrames();
      expect(mockFetch).toHaveBeenCalledWith('https://api.uzerflow.test/products/frames', expect.anything());
    });

    it('calculatePrice calls POST /products/calculate-price', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ total: 100 }));
      const client = await getClient();
      await client.products.calculatePrice({ size: 'A4', paperType: 'matte', frameType: 'none' } as any);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/products/calculate-price',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('users', () => {
    it('get calls GET /users/:id', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 'u1' }));
      const client = await getClient();
      await client.users.get('u1');
      expect(mockFetch).toHaveBeenCalledWith('https://api.uzerflow.test/users/u1', expect.anything());
    });

    it('update calls PATCH /users/:id', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 'u1' }));
      const client = await getClient();
      await client.users.update('u1', { name: 'New' } as any);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/users/u1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });

    it('getAddresses calls GET /users/:id/addresses', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse([]));
      const client = await getClient();
      await client.users.getAddresses('u1');
      expect(mockFetch).toHaveBeenCalledWith('https://api.uzerflow.test/users/u1/addresses', expect.anything());
    });

    it('addAddress calls POST /users/:id/addresses', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ id: 'a1' }));
      const client = await getClient();
      await client.users.addAddress('u1', { street: '123 Main' } as any);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.uzerflow.test/users/u1/addresses',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('uzerflowFetch error handling', () => {
    it('throws error message from API response', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ message: 'Rate limited' }, false, 429));

      const client = await getClient();
      await expect(client.orders.get('x')).rejects.toThrow('Rate limited');
    });

    it('throws generic error when response body is unparseable', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new Error('parse error')),
      });

      const client = await getClient();
      await expect(client.orders.get('x')).rejects.toThrow('Unknown error');
    });
  });
});
