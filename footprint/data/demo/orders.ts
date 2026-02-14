/**
 * Demo Orders
 *
 * Sample order data covering all statuses for UI testing.
 */

import type { Order, OrderItem, OrderStatus, Address } from '@/types';
import { demoAddresses } from './users';
import { originalImages } from './images';

// Helper to create order items
function createOrderItem(overrides?: Partial<OrderItem>): OrderItem {
  const id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    orderId: '',
    originalImageUrl: originalImages[0],
    transformedImageUrl: 'https://picsum.photos/seed/transformed1/800/600',
    style: 'watercolor',
    size: 'A4',
    paperType: 'matte',
    frameType: 'black',
    price: 208, // A4 (129) + matte (0) + black (79)
    createdAt: new Date(),
    ...overrides,
  };
}

// Convert SavedAddress to Address (they're compatible)
function toAddress(saved: (typeof demoAddresses)[0]): Address {
  return {
    name: saved.name,
    street: saved.street,
    city: saved.city,
    postalCode: saved.postalCode,
    country: saved.country,
    phone: saved.phone,
    isDefault: saved.isDefault,
  };
}

// Demo orders covering all statuses
export const demoOrders: Order[] = [
  // Pending order
  {
    id: 'demo_order_001',
    userId: 'demo_user_001',
    status: 'pending',
    items: [
      createOrderItem({
        id: 'item_001',
        orderId: 'demo_order_001',
        originalImageUrl: originalImages[0],
        style: 'watercolor',
        size: 'A4',
        paperType: 'matte',
        frameType: 'black',
        price: 208,
      }),
    ],
    subtotal: 208,
    shipping: 29,
    discount: 0,
    total: 237,
    isGift: false,
    giftMessage: null,
    giftWrap: false,
    wrappingStyle: null,
    scheduledDeliveryDate: null,
    shippingAddress: toAddress(demoAddresses[0]),
    billingAddress: toAddress(demoAddresses[0]),
    paymentTransactionId: null,
    paidAt: null,
    trackingNumber: null,
    carrier: null,
    shippedAt: null,
    deliveredAt: null,
    createdAt: new Date('2024-12-24T10:00:00'),
    updatedAt: new Date('2024-12-24T10:00:00'),
  },

  // Paid order
  {
    id: 'demo_order_002',
    userId: 'demo_user_001',
    status: 'paid',
    items: [
      createOrderItem({
        id: 'item_002',
        orderId: 'demo_order_002',
        originalImageUrl: originalImages[1],
        style: 'watercolor',
        size: 'A3',
        paperType: 'canvas',
        frameType: 'oak',
        price: 328, // A3 (179) + canvas (50) + oak (99)
      }),
    ],
    subtotal: 328,
    shipping: 0, // Free shipping over 299
    discount: 0,
    total: 328,
    isGift: false,
    giftMessage: null,
    giftWrap: false,
    wrappingStyle: null,
    scheduledDeliveryDate: null,
    shippingAddress: toAddress(demoAddresses[0]),
    billingAddress: toAddress(demoAddresses[0]),
    paymentTransactionId: 'pi_demo_002',
    paidAt: new Date('2024-12-23T14:30:00'),
    trackingNumber: null,
    carrier: null,
    shippedAt: null,
    deliveredAt: null,
    createdAt: new Date('2024-12-23T14:00:00'),
    updatedAt: new Date('2024-12-23T14:30:00'),
  },

  // Processing order
  {
    id: 'demo_order_003',
    userId: 'demo_user_002',
    status: 'processing',
    items: [
      createOrderItem({
        id: 'item_003',
        orderId: 'demo_order_003',
        originalImageUrl: originalImages[2],
        style: 'pop_art',
        size: 'A2',
        paperType: 'matte',
        frameType: 'white',
        price: 328, // A2 (249) + matte (0) + white (79)
      }),
    ],
    subtotal: 328,
    shipping: 0,
    discount: 0,
    total: 328,
    isGift: false,
    giftMessage: null,
    giftWrap: false,
    wrappingStyle: null,
    scheduledDeliveryDate: null,
    shippingAddress: toAddress(demoAddresses[1]),
    billingAddress: toAddress(demoAddresses[1]),
    paymentTransactionId: 'pi_demo_003',
    paidAt: new Date('2024-12-22T16:00:00'),
    trackingNumber: null,
    carrier: null,
    shippedAt: null,
    deliveredAt: null,
    createdAt: new Date('2024-12-22T15:30:00'),
    updatedAt: new Date('2024-12-22T18:00:00'),
  },

  // Printing order
  {
    id: 'demo_order_004',
    userId: 'demo_user_003',
    status: 'printing',
    items: [
      createOrderItem({
        id: 'item_004a',
        orderId: 'demo_order_004',
        originalImageUrl: originalImages[3],
        style: 'pop_art',
        size: 'A4',
        paperType: 'glossy',
        frameType: 'none',
        price: 149, // A4 (129) + glossy (20) + none (0)
      }),
      createOrderItem({
        id: 'item_004b',
        orderId: 'demo_order_004',
        originalImageUrl: originalImages[4],
        style: 'line_art_watercolor',
        size: 'A4',
        paperType: 'matte',
        frameType: 'oak',
        price: 228, // A4 (129) + matte (0) + oak (99)
      }),
    ],
    subtotal: 377,
    shipping: 0,
    discount: 30, // Discount applied
    total: 347,
    isGift: true,
    giftMessage: 'יום הולדת שמח! מקווה שתאהב את התמונות',
    giftWrap: true,
    wrappingStyle: 'festive',
    scheduledDeliveryDate: '2025-01-05',
    shippingAddress: toAddress(demoAddresses[2]),
    billingAddress: toAddress(demoAddresses[2]),
    paymentTransactionId: 'pi_demo_004',
    paidAt: new Date('2024-12-21T11:00:00'),
    trackingNumber: null,
    carrier: null,
    shippedAt: null,
    deliveredAt: null,
    createdAt: new Date('2024-12-21T10:30:00'),
    updatedAt: new Date('2024-12-22T09:00:00'),
  },

  // Shipped order
  {
    id: 'demo_order_005',
    userId: 'demo_user_001',
    status: 'shipped',
    items: [
      createOrderItem({
        id: 'item_005',
        orderId: 'demo_order_005',
        originalImageUrl: originalImages[5],
        style: 'watercolor',
        size: 'A3',
        paperType: 'matte',
        frameType: 'black',
        price: 258, // A3 (179) + matte (0) + black (79)
      }),
    ],
    subtotal: 258,
    shipping: 29,
    discount: 0,
    total: 287,
    isGift: false,
    giftMessage: null,
    giftWrap: false,
    wrappingStyle: null,
    scheduledDeliveryDate: null,
    shippingAddress: toAddress(demoAddresses[0]),
    billingAddress: toAddress(demoAddresses[0]),
    paymentTransactionId: 'pi_demo_005',
    paidAt: new Date('2024-12-18T09:00:00'),
    trackingNumber: 'IL123456789',
    carrier: 'Israel Post',
    shippedAt: new Date('2024-12-20T14:00:00'),
    deliveredAt: null,
    createdAt: new Date('2024-12-18T08:30:00'),
    updatedAt: new Date('2024-12-20T14:00:00'),
  },

  // Delivered order
  {
    id: 'demo_order_006',
    userId: 'demo_user_002',
    status: 'delivered',
    items: [
      createOrderItem({
        id: 'item_006',
        orderId: 'demo_order_006',
        originalImageUrl: originalImages[6],
        style: 'line_art',
        size: 'A5',
        paperType: 'matte',
        frameType: 'white',
        price: 168, // A5 (89) + matte (0) + white (79)
      }),
    ],
    subtotal: 168,
    shipping: 29,
    discount: 0,
    total: 197,
    isGift: false,
    giftMessage: null,
    giftWrap: false,
    wrappingStyle: null,
    scheduledDeliveryDate: null,
    shippingAddress: toAddress(demoAddresses[1]),
    billingAddress: toAddress(demoAddresses[1]),
    paymentTransactionId: 'pi_demo_006',
    paidAt: new Date('2024-12-10T12:00:00'),
    trackingNumber: 'IL987654321',
    carrier: 'Israel Post',
    shippedAt: new Date('2024-12-12T10:00:00'),
    deliveredAt: new Date('2024-12-15T16:30:00'),
    createdAt: new Date('2024-12-10T11:30:00'),
    updatedAt: new Date('2024-12-15T16:30:00'),
  },

  // Another gift order (pending)
  {
    id: 'demo_order_007',
    userId: 'demo_user_003',
    status: 'paid',
    items: [
      createOrderItem({
        id: 'item_007',
        orderId: 'demo_order_007',
        originalImageUrl: originalImages[7],
        style: 'original',
        size: 'A4',
        paperType: 'glossy',
        frameType: 'oak',
        price: 248, // A4 (129) + glossy (20) + oak (99)
      }),
    ],
    subtotal: 248,
    shipping: 29,
    discount: 0,
    total: 277,
    isGift: true,
    giftMessage: 'לאמא האהובה שלי, עם הרבה אהבה',
    giftWrap: true,
    wrappingStyle: 'classic',
    scheduledDeliveryDate: '2025-01-10',
    shippingAddress: toAddress(demoAddresses[3]),
    billingAddress: toAddress(demoAddresses[2]),
    paymentTransactionId: 'pi_demo_007',
    paidAt: new Date('2024-12-24T08:00:00'),
    trackingNumber: null,
    carrier: null,
    shippedAt: null,
    deliveredAt: null,
    createdAt: new Date('2024-12-24T07:30:00'),
    updatedAt: new Date('2024-12-24T08:00:00'),
  },
];

/**
 * Create a new demo order with custom overrides
 */
export function createDemoOrder(overrides?: Partial<Order>): Order {
  const id = `demo_order_${Date.now()}`;
  const now = new Date();

  const defaultItem = createOrderItem({
    id: `item_${Date.now()}`,
    orderId: id,
  });

  const baseOrder: Order = {
    id,
    userId: 'demo_user_001',
    status: 'pending',
    items: [defaultItem],
    subtotal: defaultItem.price,
    shipping: 29,
    discount: 0,
    total: defaultItem.price + 29,
    isGift: false,
    giftMessage: null,
    giftWrap: false,
    wrappingStyle: null,
    scheduledDeliveryDate: null,
    shippingAddress: toAddress(demoAddresses[0]),
    billingAddress: toAddress(demoAddresses[0]),
    paymentTransactionId: null,
    paidAt: null,
    trackingNumber: null,
    carrier: null,
    shippedAt: null,
    deliveredAt: null,
    createdAt: now,
    updatedAt: now,
  };

  // Apply overrides and set status-dependent fields
  const order = { ...baseOrder, ...overrides };

  // Set status-dependent timestamps
  if (order.status === 'paid' && !order.paidAt) {
    order.paidAt = now;
  }
  if (order.status === 'shipped' && !order.shippedAt) {
    order.shippedAt = now;
    order.trackingNumber = order.trackingNumber || `IL${Date.now()}`;
    order.carrier = order.carrier || 'Israel Post';
    if (!order.paidAt) order.paidAt = new Date(now.getTime() - 86400000 * 2);
  }
  if (order.status === 'delivered' && !order.deliveredAt) {
    order.deliveredAt = now;
    if (!order.shippedAt) order.shippedAt = new Date(now.getTime() - 86400000 * 3);
    if (!order.paidAt) order.paidAt = new Date(now.getTime() - 86400000 * 5);
    order.trackingNumber = order.trackingNumber || `IL${Date.now()}`;
    order.carrier = order.carrier || 'Israel Post';
  }

  return order;
}

/**
 * Get a demo order by status
 */
export function getDemoOrderByStatus(status: OrderStatus): Order | undefined {
  return demoOrders.find((o) => o.status === status);
}

/**
 * Get all orders for a user
 */
export function getDemoOrdersByUser(userId: string): Order[] {
  return demoOrders.filter((o) => o.userId === userId);
}
