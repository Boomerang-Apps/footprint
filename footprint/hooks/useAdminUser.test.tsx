/**
 * useAdminUser Hook Tests - ADMIN-04
 *
 * Tests for the admin user detail hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminUser, useUpdateUserRole, useUpdateUserStatus } from './useAdminUser';
import React from 'react';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockUserDetail = {
  id: 'user-1',
  email: 'john@example.com',
  name: 'John Doe',
  phone: '054-1234567',
  avatarUrl: 'https://example.com/avatar.jpg',
  preferredLanguage: 'he',
  isAdmin: false,
  status: 'active',
  orderCount: 5,
  totalSpent: 1250,
  lastOrderDate: '2026-01-18T10:00:00Z',
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-01-20T10:00:00Z',
  addresses: [
    {
      id: 'addr-1',
      name: 'Home',
      street: 'Herzl 1',
      city: 'Tel Aviv',
      postalCode: '12345',
      isDefault: true,
    },
  ],
  orders: [
    {
      id: 'order-1',
      orderNumber: 'FP-2026-001',
      status: 'delivered',
      total: 237,
      createdAt: '2026-01-18T10:00:00Z',
    },
  ],
};

describe('useAdminUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch user details successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserDetail),
    });

    const { result } = renderHook(() => useAdminUser({ userId: 'user-1' }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user?.id).toBe('user-1');
    expect(result.current.user?.email).toBe('john@example.com');
    expect(result.current.user?.name).toBe('John Doe');
    expect(result.current.user?.addresses).toHaveLength(1);
    expect(result.current.user?.orders).toHaveLength(1);
  });

  it('should include order count and total spent', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUserDetail),
    });

    const { result } = renderHook(() => useAdminUser({ userId: 'user-1' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.user?.orderCount).toBe(5);
    expect(result.current.user?.totalSpent).toBe(1250);
  });

  it('should handle 404 error for non-existent user', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'משתמש לא נמצא' }),
    });

    const { result } = renderHook(() => useAdminUser({ userId: 'non-existent' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('משתמש לא נמצא');
  });

  it('should not fetch when disabled', async () => {
    const { result } = renderHook(
      () => useAdminUser({ userId: 'user-1', enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('useUpdateUserRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should update user role successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        user: { ...mockUserDetail, isAdmin: true },
      }),
    });

    const { result } = renderHook(() => useUpdateUserRole(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userId: 'user-1', isAdmin: true });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/users/user-1/role',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ isAdmin: true }),
      })
    );
  });

  it('should handle role update error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'לא ניתן להסיר הרשאות מעצמך' }),
    });

    const { result } = renderHook(() => useUpdateUserRole(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userId: 'admin-user-id', isAdmin: false });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('לא ניתן להסיר הרשאות מעצמך');
  });
});

describe('useUpdateUserStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should update user status successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        success: true,
        user: { ...mockUserDetail, status: 'inactive' },
      }),
    });

    const { result } = renderHook(() => useUpdateUserStatus(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userId: 'user-1', status: 'inactive' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/admin/users/user-1/status',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'inactive' }),
      })
    );
  });

  it('should handle status update error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'לא ניתן להשבית את החשבון שלך' }),
    });

    const { result } = renderHook(() => useUpdateUserStatus(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userId: 'admin-user-id', status: 'inactive' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('לא ניתן להשבית את החשבון שלך');
  });
});
