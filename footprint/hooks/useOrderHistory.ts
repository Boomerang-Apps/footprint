'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import type { Order, OrderStatus } from '@/types';

export interface UseOrderHistoryOptions {
  /** User ID to fetch orders for - if undefined, fetches current user's orders */
  userId?: string;
  /** Filter orders by status */
  statusFilter?: OrderStatus | 'all';
  /** Current page number (1-indexed) */
  page?: number;
  /** Number of orders per page */
  pageSize?: number;
  /** Enable/disable the query */
  enabled?: boolean;
}

export interface OrderHistoryData {
  orders: Order[];
  totalOrders: number;
  totalSpent: number;
  inTransitCount: number;
  /** Total number of pages */
  totalPages: number;
  /** Current page number */
  currentPage: number;
  /** Whether there are more pages */
  hasNextPage: boolean;
  /** Whether there are previous pages */
  hasPrevPage: boolean;
}

const DEFAULT_PAGE_SIZE = 10;

/**
 * Hook to fetch and manage order history data
 * Uses React Query for caching and automatic refetching
 */
export function useOrderHistory({
  userId,
  statusFilter = 'all',
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true,
}: UseOrderHistoryOptions = {}) {
  const {
    data,
    error,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['orderHistory', userId, statusFilter, page, pageSize],
    queryFn: async () => {
      // Fetch orders from API
      const allOrders = await api.orders.list(userId);

      // Filter orders by status if specified
      // Group related statuses: "processing" includes pending, paid, processing, printing
      const statusGroups: Record<string, OrderStatus[]> = {
        processing: ['pending', 'paid', 'processing', 'printing'],
        shipped: ['shipped'],
        delivered: ['delivered'],
      };
      const filteredOrders = statusFilter === 'all'
        ? allOrders
        : allOrders.filter(order => {
            const group = statusGroups[statusFilter];
            return group ? group.includes(order.status) : order.status === statusFilter;
          });

      // Sort orders by creation date (newest first)
      const sortedOrders = filteredOrders.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Calculate pagination
      const totalFilteredOrders = sortedOrders.length;
      const totalPages = Math.ceil(totalFilteredOrders / pageSize);
      const currentPage = Math.min(Math.max(1, page), totalPages || 1);
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

      // Calculate statistics from all orders (not filtered)
      const totalOrders = allOrders.length;
      const totalSpent = allOrders.reduce((sum, order) => sum + order.total, 0);
      const inTransitCount = allOrders.filter(order =>
        ['processing', 'printing', 'shipped'].includes(order.status)
      ).length;

      return {
        orders: paginatedOrders,
        totalOrders,
        totalSpent,
        inTransitCount,
        totalPages,
        currentPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      } as OrderHistoryData;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors (401)
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    data: data || {
      orders: [],
      totalOrders: 0,
      totalSpent: 0,
      inTransitCount: 0,
      totalPages: 0,
      currentPage: 1,
      hasNextPage: false,
      hasPrevPage: false,
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
    retry: (failureCount, error) => {
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}