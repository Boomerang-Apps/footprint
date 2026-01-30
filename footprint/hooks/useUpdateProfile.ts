'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Profile } from './useProfile';

export interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
}

export interface UpdateProfileResponse {
  success: boolean;
  profile: Profile;
}

export interface UseUpdateProfileOptions {
  /** Callback on successful update */
  onSuccess?: (data: UpdateProfileResponse) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

/**
 * Hook to update current user's profile
 * Uses React Query mutation for optimistic updates
 */
export function useUpdateProfile(options: UseUpdateProfileOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation<UpdateProfileResponse, Error, UpdateProfileInput>(
    {
      mutationFn: async (input: UpdateProfileInput) => {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }

        return response.json();
      },
      onSuccess: (data) => {
        // Invalidate profile query to refetch updated data
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        options.onSuccess?.(data);
      },
      onError: (error) => {
        options.onError?.(error);
      },
    }
  );

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
