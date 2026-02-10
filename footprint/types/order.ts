// Order Types for Footprint

import type { StyleType, SizeType, PaperType, FrameType } from './product';
import type { Address } from './user';

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

/**
 * Gift wrapping style options
 * @story GF-04
 */
export type WrappingStyle = 'classic' | 'festive' | 'minimalist';

/**
 * Gift wrapping price in ILS
 */
export const GIFT_WRAPPING_PRICE = 15;

// Re-export Address from user.ts for convenience
export type { Address };

export interface OrderItem {
  id: string;
  orderId: string;
  originalImageUrl: string;
  transformedImageUrl: string | null;
  style: StyleType;
  size: SizeType;
  paperType: PaperType;
  frameType: FrameType;
  price: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  itemCount?: number;
  
  // Pricing
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  
  // Gift options
  isGift: boolean;
  giftMessage: string | null;
  giftWrap: boolean;
  wrappingStyle: WrappingStyle | null;
  hasPassepartout?: boolean;

  // Scheduled Delivery (GF-05)
  scheduledDeliveryDate: string | null;

  // Addresses
  shippingAddress: Address;
  billingAddress: Address;
  
  // Payment
  paymentTransactionId: string | null;
  paidAt: Date | null;
  
  // Shipping
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  isGift: boolean;
  giftMessage?: string;
  giftWrap?: boolean;
  wrappingStyle?: WrappingStyle;
  scheduledDeliveryDate?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  discountCode?: string;
}

export interface CreateOrderItemInput {
  originalImageUrl: string;
  transformedImageUrl?: string;
  style: StyleType;
  size: SizeType;
  paperType: PaperType;
  frameType: FrameType;
}

// Re-export product types for convenience
export type { StyleType, SizeType, PaperType, FrameType };
