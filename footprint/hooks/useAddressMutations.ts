'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AddressResponse, CreateAddressInput, UpdateAddressInput as UpdateAddressData } from '@/lib/validation/address';

// ============ CREATE ADDRESS ============

export interface CreateAddressResponse {
  success: boolean;
  address: AddressResponse;
}

export interface UseCreateAddressOptions {
  onSuccess?: (data: CreateAddressResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to create a new address
 */
export function useCreateAddress(options: UseCreateAddressOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation<CreateAddressResponse, Error, CreateAddressInput>({
    mutationFn: async (input: CreateAddressInput) => {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create address');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

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

// ============ UPDATE ADDRESS ============

export interface UpdateAddressResponse {
  success: boolean;
  address: AddressResponse;
}

export interface UpdateAddressMutationInput {
  id: string;
  data: UpdateAddressData;
}

export interface UseUpdateAddressOptions {
  onSuccess?: (data: UpdateAddressResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to update an existing address
 */
export function useUpdateAddress(options: UseUpdateAddressOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    UpdateAddressResponse,
    Error,
    UpdateAddressMutationInput
  >({
    mutationFn: async ({ id, data }) => {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update address');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

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

// ============ DELETE ADDRESS ============

export interface DeleteAddressResponse {
  success: boolean;
}

export interface UseDeleteAddressOptions {
  onSuccess?: (data: DeleteAddressResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to delete an address
 */
export function useDeleteAddress(options: UseDeleteAddressOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation<DeleteAddressResponse, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete address');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

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

// ============ SET DEFAULT ADDRESS ============

export interface SetDefaultAddressResponse {
  success: boolean;
  address: AddressResponse;
}

export interface UseSetDefaultAddressOptions {
  onSuccess?: (data: SetDefaultAddressResponse) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to set an address as default
 */
export function useSetDefaultAddress(options: UseSetDefaultAddressOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation<SetDefaultAddressResponse, Error, string>({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/addresses/${id}/default`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set default address');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });

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
