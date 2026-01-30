'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Order, OrderStatus } from '@/types';

export interface UseOrderHistoryOptions {
  /** User ID to fetch orders for - if undefined, fetches current user's orders */
  userId?: string;
  /** Filter orders by status */
  statusFilter?: OrderStatus | 'all';
  /** Enable/disable the query */
  enabled?: boolean;
}

export interface OrderHistoryData {
  orders: Order[];
  totalOrders: number;
  totalSpent: number;
  inTransitCount: number;
}

/**
 * Hook to fetch and manage order history data
 * Uses React Query for caching and automatic refetching
 */
export function useOrderHistory({
  userId,
  statusFilter = 'all',
  enabled = true,
}: UseOrderHistoryOptions = {}) {
  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['orderHistory', userId, statusFilter],
    queryFn: async () => {
      // Fetch orders from API
      const allOrders = await api.orders.list(userId);

      // Filter orders by status if specified
      const filteredOrders = statusFilter === 'all'
        ? allOrders
        : allOrders.filter(order => order.status === statusFilter);

      // Sort orders by creation date (newest first)
      const sortedOrders = filteredOrders.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Calculate statistics from all orders (not filtered)
      const totalOrders = allOrders.length;
      const totalSpent = allOrders.reduce((sum, order) => sum + order.total, 0);
      const inTransitCount = allOrders.filter(order =>
        ['processing', 'printing', 'shipped'].includes(order.status)
      ).length;

      return {
        orders: sortedOrders,
        totalOrders,
        totalSpent,
        inTransitCount,
      } as OrderHistoryData;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    retry: 3,
  });

  return {
    data: data || {
      orders: [],
      totalOrders: 0,
      totalSpent: 0,
      inTransitCount: 0,
    },
    error,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(orderId: string, enabled = true) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => api.orders.get(orderId),
    enabled: enabled && !!orderId,
    staleTime: 30 * 60 * 1000, // Consider data stale after 30 minutes
    retry: 3,
  });
}