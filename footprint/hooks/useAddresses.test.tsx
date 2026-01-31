/**
 * Tests for useAddresses hook - UI-05B
 *
 * Tests for fetching user addresses list
 * Following TDD: RED phase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAddresses } from './useAddresses';
import type { ReactNode } from 'react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockAddressesResponse = {
  addresses: [
    {
      id: 'addr-1',
      name: 'Home',
      street: 'Dizengoff 100',
      apartment: 'Apt 5',
      city: 'Tel Aviv',
      postalCode: '6433001',
      country: 'Israel',
      phone: '050-1234567',
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'addr-2',
      name: 'Work',
      street: 'Rothschild 50',
      apartment: null,
      city: 'Tel Aviv',
      postalCode: '6688101',
      country: 'Israel',
      phone: null,
      isDefault: false,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
  ],
};

describe('useAddresses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Fetch', () => {
    it('should fetch addresses list successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAddressesResponse),
      });

      const { result } = renderHook(() => useAddresses(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockAddressesResponse.addresses);
      expect(result.current.isError).toBe(false);
    });

    it('should call correct API endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAddressesResponse),
      });

      renderHook(() => useAddresses(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/addresses', {
          credentials: 'include',
        });
      });
    });

    it('should return addresses with all fields', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAddressesResponse),
      });

      const { result } = renderHook(() => useAddresses(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.[0]).toHaveProperty('id');
      expect(result.current.data?.[0]).toHaveProperty('name');
      expect(result.current.data?.[0]).toHaveProperty('street');
      expect(result.current.data?.[0]).toHaveProperty('city');
      expect(result.current.data?.[0]).toHaveProperty('postalCode');
      expect(result.current.data?.[0]).toHaveProperty('isDefault');
    });

    it('should return empty array when no addresses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ addresses: [] }),
      });

      const { result } = renderHook(() => useAddresses(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('Loading State', () => {
    it('should have isLoading true initially', () => {
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockAddressesResponse),
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useAddresses(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const { result } = renderHook(() => useAddresses(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toContain('Unauthorized');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAddresses(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toContain('Network error');
    });

    it('should handle 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      const { result } = renderHook(() => useAddresses(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('Enabled Option', () => {
    it('should not fetch when enabled is false', () => {
      const { result } = renderHook(() => useAddresses({ enabled: false }), {
        wrapper: createWrapper(),
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
    });

    it('should fetch when enabled is true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockAddressesResponse),
      });

      renderHook(() => useAddresses({ enabled: true }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });
  });

  describe('Refetch', () => {
    it('should provide refetch function', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockAddressesResponse),
      });

      const { result } = renderHook(() => useAddresses(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');

      await result.current.refetch();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
