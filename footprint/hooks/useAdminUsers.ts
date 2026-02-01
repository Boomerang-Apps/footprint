'use client';

import { useQuery } from '@tanstack/react-query';

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  preferredLanguage: 'he' | 'en';
  isAdmin: boolean;
  status: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  users: AdminUserSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUserStats {
  totalUsers: number;
  newThisWeek: number;
  newThisMonth: number;
  adminCount: number;
  activeUsers: number;
}

export interface UseAdminUsersOptions {
  /** Current page number */
  page?: number;
  /** Items per page */
  limit?: number;
  /** Search query (email or name) */
  search?: string;
  /** Filter by role (all, admin, user) */
  role?: 'all' | 'admin' | 'user';
  /** Filter by registration date from */
  registeredFrom?: string;
  /** Filter by registration date to */
  registeredTo?: string;
  /** Sort by field */
  sortBy?: 'created_at' | 'name' | 'order_count' | 'email';
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Enable/disable the query */
  enabled?: boolean;
}

/**
 * Hook to fetch admin users list with pagination, search, and filters
 * Uses React Query for caching and automatic refetching
 */
export function useAdminUsers({
  page = 1,
  limit = 20,
  search = '',
  role = 'all',
  registeredFrom,
  registeredTo,
  sortBy = 'created_at',
  sortOrder = 'desc',
  enabled = true,
}: UseAdminUsersOptions = {}) {
  const queryParams = new URLSearchParams();
  queryParams.set('page', page.toString());
  queryParams.set('limit', limit.toString());
  if (search) queryParams.set('search', search);
  if (role !== 'all') queryParams.set('role', role);
  if (registeredFrom) queryParams.set('registeredFrom', registeredFrom);
  if (registeredTo) queryParams.set('registeredTo', registeredTo);
  queryParams.set('sortBy', sortBy);
  queryParams.set('sortOrder', sortOrder);

  const { data, error, isLoading, isError, refetch } = useQuery<
    AdminUsersResponse,
    Error
  >({
    queryKey: ['admin-users', page, limit, search, role, registeredFrom, registeredTo, sortBy, sortOrder],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      return response.json();
    },
    enabled,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    retry: false,
  });

  return {
    users: data?.users || [],
    total: data?.total || 0,
    page: data?.page || page,
    limit: data?.limit || limit,
    totalPages: data?.totalPages || 0,
    error,
    isLoading: enabled ? isLoading : false,
    isError,
    refetch,
  };
}

/**
 * Hook to fetch admin user statistics
 */
export function useAdminUserStats({ enabled = true }: { enabled?: boolean } = {}) {
  const { data, error, isLoading, isError, refetch } = useQuery<
    AdminUserStats,
    Error
  >({
    queryKey: ['admin-users-stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users/stats', {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user stats');
      }

      return response.json();
    },
    enabled,
    staleTime: 60 * 1000, // Consider data stale after 1 minute
    retry: false,
  });

  return {
    stats: data,
    error,
    isLoading: enabled ? isLoading : false,
    isError,
    refetch,
  };
}
