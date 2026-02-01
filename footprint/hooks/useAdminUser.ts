'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

export interface AdminUserDetail {
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
  addresses: Address[];
  orders: OrderSummary[];
}

export interface UseAdminUserOptions {
  /** User ID to fetch */
  userId: string;
  /** Enable/disable the query */
  enabled?: boolean;
}

/**
 * Hook to fetch a single user's full details for admin view
 */
export function useAdminUser({ userId, enabled = true }: UseAdminUserOptions) {
  const { data, error, isLoading, isError, refetch } = useQuery<
    AdminUserDetail,
    Error
  >({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user');
      }

      return response.json();
    },
    enabled: enabled && !!userId,
    staleTime: 30 * 1000,
    retry: false,
  });

  return {
    user: data,
    error,
    isLoading: enabled ? isLoading : false,
    isError,
    refetch,
  };
}

/**
 * Hook to update user role (admin status)
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isAdmin }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-stats'] });
    },
  });
}

/**
 * Hook to update user status (active/inactive)
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-stats'] });
    },
  });
}
