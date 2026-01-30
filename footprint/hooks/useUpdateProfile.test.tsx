/**
 * Tests for useUpdateProfile hook - UI-05A
 *
 * Tests for updating user profile data
 * Following TDD: RED phase
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateProfile } from './useUpdateProfile';
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

const mockProfileResponse = {
  success: true,
  profile: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Updated Name',
    phone: '050-9876543',
    avatarUrl: 'https://example.com/avatar.jpg',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
};

describe('useUpdateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Successful Update', () => {
    it('should update profile successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileResponse),
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ name: 'Updated Name' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should call correct API endpoint with PUT method', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileResponse),
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ name: 'Test' });
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: 'Test' }),
      });
    });

    it('should update name field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileResponse),
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      let responseData;
      await act(async () => {
        responseData = await result.current.mutateAsync({ name: 'New Name' });
      });

      expect(responseData).toEqual(mockProfileResponse);
    });

    it('should update phone field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileResponse),
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ phone: '050-1111111' });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/profile',
        expect.objectContaining({
          body: JSON.stringify({ phone: '050-1111111' }),
        })
      );
    });

    it('should update multiple fields at once', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileResponse),
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: 'New Name',
          phone: '050-2222222',
        });
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/profile',
        expect.objectContaining({
          body: JSON.stringify({ name: 'New Name', phone: '050-2222222' }),
        })
      );
    });
  });

  describe('Loading State', () => {
    it('should have isPending true during mutation', async () => {
      let resolvePromise: (value: unknown) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate({ name: 'Test' });
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      // Resolve the promise
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve(mockProfileResponse),
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle 400 validation error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () =>
          Promise.resolve({ error: 'שם חייב להכיל לפחות 2 תווים' }),
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ name: 'A' });
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error?.message).toContain('שם חייב להכיל');
    });

    it('should handle 401 unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ name: 'Test' });
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error?.message).toContain('Unauthorized');
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ name: 'Test' });
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
      expect(result.current.error?.message).toContain('Network error');
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback on successful update', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProfileResponse),
      });

      const onSuccess = vi.fn();

      const { result } = renderHook(() => useUpdateProfile({ onSuccess }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ name: 'Test' });
      });

      expect(onSuccess).toHaveBeenCalledWith(mockProfileResponse);
    });

    it('should call onError callback on failed update', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Validation error' }),
      });

      const onError = vi.fn();

      const { result } = renderHook(() => useUpdateProfile({ onError }), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ name: 'A' });
        } catch {
          // Expected to throw
        }
      });

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Reset', () => {
    it('should reset mutation state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Error' }),
      });

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ name: 'Test' });
        } catch {
          // Expected
        }
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      act(() => {
        result.current.reset();
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(false);
      });
      expect(result.current.error).toBeNull();
    });
  });
});
