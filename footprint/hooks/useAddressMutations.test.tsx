/**
 * Tests for address mutation hooks - UI-05B
 *
 * Tests for create, update, delete, and setDefault mutations
 * Following TDD: RED phase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from './useAddressMutations';
import type { ReactNode } from 'react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockAddress = {
  id: 'addr-1',
  name: 'Home',
  street: 'Dizengoff 100',
  apartment: 'Apt 5',
  city: 'Tel Aviv',
  postalCode: '6433001',
  country: 'Israel',
  phone: '050-1234567',
  isDefault: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

describe('useCreateAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Create', () => {
    it('should create address successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, address: mockAddress }),
      });

      const { result } = renderHook(() => useCreateAddress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: 'Home',
          street: 'Dizengoff 100',
          city: 'Tel Aviv',
          postalCode: '6433001',
          country: 'Israel',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should call correct API endpoint with POST', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, address: mockAddress }),
      });

      const { result } = renderHook(() => useCreateAddress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: 'Home',
          street: 'Dizengoff 100',
          city: 'Tel Aviv',
          postalCode: '6433001',
          country: 'Israel',
        });
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: expect.any(String),
      });
    });

    it('should include all fields in request body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, address: mockAddress }),
      });

      const { result } = renderHook(() => useCreateAddress(), {
        wrapper: createWrapper(),
      });

      const input = {
        name: 'Home',
        street: 'Dizengoff 100',
        apartment: 'Apt 5',
        city: 'Tel Aviv',
        postalCode: '6433001',
        country: 'Israel',
        phone: '050-1234567',
      };

      await act(async () => {
        await result.current.mutateAsync(input);
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody).toMatchObject(input);
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Postal code must be 7 digits' }),
      });

      const { result } = renderHook(() => useCreateAddress(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            name: 'Home',
            street: 'Dizengoff 100',
            city: 'Tel Aviv',
            postalCode: '123', // Invalid
          country: 'Israel',
          });
        })
      ).rejects.toThrow('Postal code must be 7 digits');
    });

    it('should handle 401 unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const { result } = renderHook(() => useCreateAddress(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            name: 'Home',
            street: 'Dizengoff 100',
            city: 'Tel Aviv',
            postalCode: '6433001',
            country: 'Israel',
          });
        })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('Loading State', () => {
    it('should have isPending true during mutation', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useCreateAddress(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({
          name: 'Home',
          street: 'Dizengoff 100',
          city: 'Tel Aviv',
          postalCode: '6433001',
          country: 'Israel',
        });
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      await act(async () => {
        resolvePromise!({
          ok: true,
          json: () => Promise.resolve({ success: true, address: mockAddress }),
        });
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, address: mockAddress }),
      });

      const onSuccess = vi.fn();
      const { result } = renderHook(() => useCreateAddress({ onSuccess }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: 'Home',
          street: 'Dizengoff 100',
          city: 'Tel Aviv',
          postalCode: '6433001',
          country: 'Israel',
        });
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should call onError callback', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid data' }),
      });

      const onError = vi.fn();
      const { result } = renderHook(() => useCreateAddress({ onError }), {
        wrapper: createWrapper(),
      });

      try {
        await act(async () => {
          await result.current.mutateAsync({
            name: 'Home',
            street: 'Dizengoff 100',
            city: 'Tel Aviv',
            postalCode: '123',
            country: 'Israel',
          });
        });
      } catch {
        // Expected
      }

      expect(onError).toHaveBeenCalled();
    });
  });
});

describe('useUpdateAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Update', () => {
    it('should update address successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, address: { ...mockAddress, name: 'Updated' } }),
      });

      const { result } = renderHook(() => useUpdateAddress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'addr-1',
          data: { name: 'Updated' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should call correct API endpoint with PUT', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, address: mockAddress }),
      });

      const { result } = renderHook(() => useUpdateAddress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'addr-1',
          data: { name: 'Updated' },
        });
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/addresses/addr-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: expect.any(String),
      });
    });

    it('should include only updated fields in body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, address: mockAddress }),
      });

      const { result } = renderHook(() => useUpdateAddress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: 'addr-1',
          data: { name: 'New Name', phone: '052-9876543' },
        });
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody).toEqual({ name: 'New Name', phone: '052-9876543' });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Address not found' }),
      });

      const { result } = renderHook(() => useUpdateAddress(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            id: 'nonexistent',
            data: { name: 'Updated' },
          });
        })
      ).rejects.toThrow('Address not found');
    });

    it('should handle 403 forbidden error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Access denied' }),
      });

      const { result } = renderHook(() => useUpdateAddress(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            id: 'addr-1',
            data: { name: 'Updated' },
          });
        })
      ).rejects.toThrow('Access denied');
    });
  });
});

describe('useDeleteAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Delete', () => {
    it('should delete address successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDeleteAddress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('addr-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should call correct API endpoint with DELETE', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const { result } = renderHook(() => useDeleteAddress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('addr-1');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/addresses/addr-1', {
        method: 'DELETE',
        credentials: 'include',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 default address error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({
            error: 'Cannot delete default address while other addresses exist',
          }),
      });

      const { result } = renderHook(() => useDeleteAddress(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync('addr-1');
        })
      ).rejects.toThrow('Cannot delete default address');
    });

    it('should handle 404 not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Address not found' }),
      });

      const { result } = renderHook(() => useDeleteAddress(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync('nonexistent');
        })
      ).rejects.toThrow('Address not found');
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const onSuccess = vi.fn();
      const { result } = renderHook(() => useDeleteAddress({ onSuccess }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('addr-1');
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });
});

describe('useSetDefaultAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Set Default', () => {
    it('should set default address successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, address: { ...mockAddress, isDefault: true } }),
      });

      const { result } = renderHook(() => useSetDefaultAddress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('addr-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should call correct API endpoint with PATCH', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, address: { ...mockAddress, isDefault: true } }),
      });

      const { result } = renderHook(() => useSetDefaultAddress(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('addr-1');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/addresses/addr-1/default', {
        method: 'PATCH',
        credentials: 'include',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Address not found' }),
      });

      const { result } = renderHook(() => useSetDefaultAddress(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync('nonexistent');
        })
      ).rejects.toThrow('Address not found');
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, address: { ...mockAddress, isDefault: true } }),
      });

      const onSuccess = vi.fn();
      const { result } = renderHook(() => useSetDefaultAddress({ onSuccess }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('addr-1');
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
