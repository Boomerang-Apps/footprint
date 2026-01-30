'use client';

import { useQuery } from '@tanstack/react-query';

export interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UseProfileOptions {
  /** Enable/disable the query */
  enabled?: boolean;
}

/**
 * Hook to fetch current user's profile
 * Uses React Query for caching and automatic refetching
 */
export function useProfile({ enabled = true }: UseProfileOptions = {}) {
  const { data, error, isLoading, isError, refetch } = useQuery<
    Profile,
    Error
  >({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile', {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }

      return response.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    retry: false,
  });

  return {
    data,
    error,
    isLoading: enabled ? isLoading : false,
    isError,
    refetch,
  };
}
