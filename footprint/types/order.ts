// Order Types for Footprint

import type { StyleType, SizeType, PaperType, FrameType } from './product';

export type OrderStatus = 
  | 'pending'
  | 'paid'
  | 'processing'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Address {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

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
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  
  // Gift options
  isGift: boolean;
  giftMessage: string | null;
  giftWrap: boolean;
  
  // Addresses
  shippingAddress: Address;
  billingAddress: Address;
  
  // Payment
  stripePaymentIntentId: string | null;
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
