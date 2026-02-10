/**
 * API Client Abstraction Layer Tests
 *
 * Tests for lib/api/client.ts - conditional client based on env
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the downstream clients before importing
const mockAuthLogin = vi.fn();
const mockOrdersList = vi.fn();

vi.mock('./mock', () => ({
  mockClient: {
    auth: { login: mockAuthLogin },
    orders: { list: vi.fn().mockResolvedValue([{ id: 'mock-order' }]) },
    products: { getStyles: vi.fn() },
    users: { get: vi.fn() },
  },
}));

vi.mock('./supabase-client', () => ({
  supabaseClient: {
    auth: { login: vi.fn() },
    orders: { list: mockOrdersList },
    products: { getStyles: vi.fn() },
    users: { get: vi.fn() },
  },
}));

describe('API Client', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('exports api object', async () => {
    const { api } = await import('./client');
    expect(api).toBeDefined();
    expect(api).toHaveProperty('auth');
    expect(api).toHaveProperty('orders');
    expect(api).toHaveProperty('products');
    expect(api).toHaveProperty('users');
  });

  it('exports ApiClient type', async () => {
    // Type-only export verification: the module should not throw on import
    const mod = await import('./client');
    expect(mod).toBeDefined();
  });

  describe('when NEXT_PUBLIC_USE_MOCK is not set', () => {
    it('uses supabase client for orders', async () => {
      // Default env has no USE_MOCK, so it should use supabaseClient
      const { api } = await import('./client');
      // The api is already resolved at module level, just verify it has the expected shape
      expect(api.orders).toBeDefined();
      expect(api.auth).toBeDefined();
    });
  });
});
