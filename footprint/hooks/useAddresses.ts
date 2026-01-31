'use client';

import { useQuery } from '@tanstack/react-query';
import type { AddressResponse } from '@/lib/validation/address';

export interface UseAddressesOptions {
  /** Enable/disable the query */
  enabled?: boolean;
}

/**
 * Hook to fetch current user's addresses
 * Uses React Query for caching and automatic refetching
 */
export function useAddresses({ enabled = true }: UseAddressesOptions = {}) {
  const { data, error, isLoading, isError, refetch } = useQuery<
    AddressResponse[],
    Error
  >({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await fetch('/api/addresses', {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch addresses');
      }

      const result = await response.json();
      return result.addresses;
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
