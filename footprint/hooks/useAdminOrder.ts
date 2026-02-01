/**
 * useAdminOrder Hook
 *
 * Fetch single order details for admin view.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type FulfillmentStatus } from '@/lib/fulfillment/status-transitions';

export interface OrderItem {
  id: string;
  productName: string;
  styleName: string;
  size: string;
  paperType: string;
  frameType: string | null;
  quantity: number;
  price: number;
  printFileUrl: string | null;
  thumbnailUrl: string | null;
  originalImageUrl: string | null;
  transformedImageUrl: string | null;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  street2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface OrderShipment {
  id: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  labelUrl: string | null;
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: FulfillmentStatus;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  total: number;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  discountCode: string | null;
  itemCount: number;
  items: OrderItem[];
  customerEmail: string | null;
  customerName: string | null;
  customerPhone: string | null;
  customerId: string | null;
  shippingAddress: ShippingAddress | null;
  isGift: boolean;
  giftMessage: string | null;
  notes: string | null;
  trackingNumber: string | null;
  shipments: OrderShipment[];
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

async function fetchOrder(orderId: string): Promise<AdminOrder> {
  const response = await fetch(`/api/admin/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch order');
  }

  return response.json();
}

export function useAdminOrder(orderId: string) {
  const query = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => fetchOrder(orderId),
    enabled: !!orderId,
  });

  return {
    order: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

interface UpdateStatusParams {
  orderId: string;
  status: FulfillmentStatus;
}

async function updateOrderStatus({ orderId, status }: UpdateStatusParams): Promise<void> {
  const response = await fetch(`/api/admin/orders/${orderId}/fulfillment-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update status');
  }
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['fulfillment-orders'] });
    },
  });
}

interface AddTrackingParams {
  orderId: string;
  trackingNumber: string;
  carrier: string;
}

async function addTracking({ orderId, trackingNumber, carrier }: AddTrackingParams): Promise<void> {
  const response = await fetch(`/api/admin/orders/${orderId}/tracking`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ trackingNumber, carrier }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to add tracking');
  }
}

export function useAddTracking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTracking,
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
    },
  });
}
