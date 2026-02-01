/**
 * useFulfillmentOrders Hook - UI-07A
 *
 * Custom hook for fetching and managing fulfillment orders data.
 * Includes filtering, polling, and pagination support.
 */

import { useQuery } from '@tanstack/react-query';
import { type FulfillmentStatus } from '@/lib/fulfillment/status-transitions';

export interface FulfillmentOrder {
  id: string;
  orderNumber: string;
  status: FulfillmentStatus;
  total: number;
  itemCount: number;
  customerEmail: string | null;
  customerName: string | null;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string | null;
  items: Array<{
    id: string;
    productName: string;
    size: string;
    paperType: string;
    frameType: string | null;
    quantity: number;
    price: number;
    printFileUrl: string | null;
    thumbnailUrl: string | null;
  }>;
}

export interface FulfillmentStats {
  pendingCount: number;
  printingCount: number;
  readyCount: number;
  shippedTodayCount: number;
}

export interface FulfillmentFilters {
  status?: FulfillmentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  size?: string;
  paper?: string;
  frame?: string;
  page?: number;
  limit?: number;
}

interface FulfillmentOrdersResponse {
  orders: FulfillmentOrder[];
  grouped: Record<FulfillmentStatus, FulfillmentOrder[]>;
  stats: FulfillmentStats;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchFulfillmentOrders(filters: FulfillmentFilters): Promise<FulfillmentOrdersResponse> {
  const params = new URLSearchParams();

  if (filters.status) params.set('status', filters.status);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  if (filters.search) params.set('search', filters.search);
  if (filters.size) params.set('size', filters.size);
  if (filters.paper) params.set('paper', filters.paper);
  if (filters.frame) params.set('frame', filters.frame);
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = `/api/admin/fulfillment/orders${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch orders');
  }

  return response.json();
}

const POLLING_INTERVAL = 30000; // 30 seconds

export function useFulfillmentOrders(filters: FulfillmentFilters = {}) {
  const query = useQuery({
    queryKey: ['fulfillment-orders', filters],
    queryFn: () => fetchFulfillmentOrders(filters),
    refetchInterval: POLLING_INTERVAL,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  return {
    orders: query.data?.orders ?? [],
    grouped: query.data?.grouped ?? {
      pending: [],
      printing: [],
      ready_to_ship: [],
      shipped: [],
      delivered: [],
      cancelled: [],
    },
    stats: query.data?.stats ?? {
      pendingCount: 0,
      printingCount: 0,
      readyCount: 0,
      shippedTodayCount: 0,
    },
    total: query.data?.total ?? 0,
    page: query.data?.page ?? 1,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
