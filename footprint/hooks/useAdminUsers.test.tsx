/**
 * useAdminUsers Hook Tests - ADMIN-01
 *
 * Tests for the admin users hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAdminUsers, useAdminUserStats } from './useAdminUsers';
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

const mockUsersResponse = {
  users: [
    {
      id: 'user-1',
      email: 'john@example.com',
      name: 'John Doe',
      phone: '054-1234567',
      avatarUrl: null,
      preferredLanguage: 'he',
      isAdmin: false,
      status: 'active',
      orderCount: 5,
      totalSpent: 1250,
      lastOrderDate: '2026-01-18T10:00:00Z',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-20T10:00:00Z',
    },
    {
      id: 'user-2',
      email: 'jane@example.com',
      name: 'Jane Smith',
      phone: '054-7654321',
      avatarUrl: 'https://example.com/avatar.jpg',
      preferredLanguage: 'en',
      isAdmin: true,
      status: 'active',
      orderCount: 12,
      totalSpent: 3500,
      lastOrderDate: '2026-01-25T10:00:00Z',
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-25T10:00:00Z',
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const mockStatsResponse = {
  totalUsers: 150,
  newThisWeek: 12,
  newThisMonth: 45,
  adminCount: 3,
  activeUsers: 142,
};

describe('useAdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch users successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsersResponse),
    });

    const { result } = renderHook(() => useAdminUsers(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.users).toHaveLength(2);
    expect(result.current.total).toBe(2);
    expect(result.current.page).toBe(1);
    expect(result.current.totalPages).toBe(1);
  });

  it('should pass search query to API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockUsersResponse, users: [mockUsersResponse.users[0]] }),
    });

    const { result } = renderHook(() => useAdminUsers({ search: 'john' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('search=john'),
      expect.any(Object)
    );
  });

  it('should pass role filter to API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockUsersResponse, users: [mockUsersResponse.users[1]] }),
    });

    const { result } = renderHook(() => useAdminUsers({ role: 'admin' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('role=admin'),
      expect.any(Object)
    );
  });

  it('should pass pagination parameters to API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockUsersResponse, page: 2 }),
    });

    const { result } = renderHook(() => useAdminUsers({ page: 2, limit: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2'),
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=10'),
      expect.any(Object)
    );
  });

  it('should pass sort parameters to API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsersResponse),
    });

    const { result } = renderHook(
      () => useAdminUsers({ sortBy: 'order_count', sortOrder: 'desc' }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('sortBy=order_count'),
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('sortOrder=desc'),
      expect.any(Object)
    );
  });

  it('should handle errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to fetch users' }),
    });

    const { result } = renderHook(() => useAdminUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to fetch users');
  });

  it('should not fetch when disabled', async () => {
    const { result } = renderHook(() => useAdminUsers({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('useAdminUserStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch stats successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStatsResponse),
    });

    const { result } = renderHook(() => useAdminUserStats(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats?.totalUsers).toBe(150);
    expect(result.current.stats?.newThisWeek).toBe(12);
    expect(result.current.stats?.adminCount).toBe(3);
  });

  it('should handle errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Failed to fetch stats' }),
    });

    const { result } = renderHook(() => useAdminUserStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to fetch stats');
  });

  it('should not fetch when disabled', async () => {
    const { result } = renderHook(() => useAdminUserStats({ enabled: false }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
