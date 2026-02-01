/**
 * Supabase API Client
 *
 * Uses the existing Next.js API routes that connect to Supabase
 */

import type { ApiClient } from './types';
import type { Order, OrderStatus, OrderItem, StyleType, SizeType, PaperType, FrameType } from '@/types';

// Helper for API requests to local Next.js routes
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

export const supabaseClient: ApiClient = {
  // Authentication - handled by Supabase directly
  auth: {
    async login() {
      throw new Error('Use Supabase auth directly');
    },
    async register() {
      throw new Error('Use Supabase auth directly');
    },
    async logout() {
      throw new Error('Use Supabase auth directly');
    },
    async getSession() {
      return null;
    },
    async resetPassword() {
      throw new Error('Use Supabase auth directly');
    },
  },

  // Orders
  orders: {
    async create(input) {
      return apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },

    async get(id) {
      return apiFetch(`/orders/${id}`);
    },

    async list(): Promise<Order[]> {
      // API returns { orders: [...], total: number }
      // Transform to array of Order objects
      interface ApiOrderItem {
        id: string;
        originalImageUrl: string;
        transformedImageUrl: string | null;
        style: string;
        size: string;
        frameType: string;
      }

      interface ApiOrder {
        id: string;
        orderNumber: string;
        status: string;
        total: number;
        itemCount: number;
        createdAt: string;
        trackingNumber: string | null;
        carrier: string | null;
        items: ApiOrderItem[];
      }

      const response = await apiFetch<{ orders: ApiOrder[]; total: number }>('/orders');

      // Map API response to Order type expected by hooks
      return response.orders.map((order): Order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status as OrderStatus,
        total: order.total / 100, // Convert agorot to shekels
        itemCount: order.itemCount,
        createdAt: new Date(order.createdAt),
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        // Map items from API
        items: order.items.map((item): OrderItem => ({
          id: item.id,
          orderId: order.id,
          originalImageUrl: item.originalImageUrl,
          transformedImageUrl: item.transformedImageUrl,
          style: item.style as StyleType,
          size: item.size as SizeType,
          paperType: 'matte' as PaperType,
          frameType: item.frameType as FrameType,
          price: 0,
          createdAt: new Date(order.createdAt),
        })),
        // Default values for fields not returned by list endpoint
        userId: '',
        subtotal: order.total / 100,
        shipping: 0,
        discount: 0,
        isGift: false,
        giftMessage: null,
        giftWrap: false,
        scheduledDeliveryDate: null,
        shippingAddress: { name: '', street: '', city: '', postalCode: '', country: '' },
        billingAddress: { name: '', street: '', city: '', postalCode: '', country: '' },
        stripePaymentIntentId: null,
        paidAt: null,
        shippedAt: null,
        deliveredAt: null,
        updatedAt: new Date(order.createdAt),
      }));
    },

    async updateStatus(id, status) {
      return apiFetch(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },

    async addTracking(id, trackingNumber, carrier) {
      return apiFetch(`/admin/orders/${id}/tracking`, {
        method: 'PATCH',
        body: JSON.stringify({ trackingNumber, carrier }),
      });
    },
  },

  // Products - use static data for now
  products: {
    async getStyles() {
      return [];
    },
    async getSizes() {
      return [];
    },
    async getPapers() {
      return [];
    },
    async getFrames() {
      return [];
    },
    async calculatePrice() {
      return {
        basePrice: 0,
        paperModifier: 0,
        framePrice: 0,
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0,
      };
    },
  },

  // Users
  users: {
    async get() {
      return apiFetch('/profile');
    },
    async update(id, data) {
      return apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    async getAddresses() {
      return apiFetch('/addresses');
    },
    async addAddress(userId, address) {
      return apiFetch('/addresses', {
        method: 'POST',
        body: JSON.stringify(address),
      });
    },
  },
};
