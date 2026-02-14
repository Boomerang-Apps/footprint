/**
 * Database Types for Supabase
 *
 * These types match the database schema in supabase/migrations/001_initial_schema.sql
 * Use these for type-safe database operations.
 */

// ============================================================================
// ENUMS (matching PostgreSQL enums)
// ============================================================================

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'printing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentProvider =
  | 'payplus'
  | 'stripe'
  | 'bit'
  | 'apple_pay'
  | 'google_pay';

export type ShipmentStatus =
  | 'pending'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'returned';

export type StyleType =
  | 'original'
  | 'watercolor'
  | 'line_art'
  | 'line_art_watercolor'
  | 'pop_art';

export type SizeType = 'A5' | 'A4' | 'A3' | 'A2';

export type PaperType = 'matte' | 'glossy' | 'canvas';

export type FrameType = 'none' | 'black' | 'white' | 'oak';

// ============================================================================
// DATABASE TABLES
// ============================================================================

export interface DbProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferred_language: 'he' | 'en';
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbAddress {
  id: string;
  user_id: string | null;
  name: string;
  street: string;
  apartment: string | null;
  city: string;
  postal_code: string | null;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  status: OrderStatus;

  // Pricing (in agorot)
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  currency: string;

  // Gift options
  is_gift: boolean;
  gift_message: string | null;
  gift_wrap: boolean;
  hide_price: boolean;

  // Addresses (JSONB)
  shipping_address: AddressJson;
  billing_address: AddressJson | null;

  // Discount
  discount_code_id: string | null;

  // Notes
  customer_notes: string | null;
  admin_notes: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
}

export interface DbOrderItem {
  id: string;
  order_id: string;

  // Image URLs
  original_image_url: string;
  original_image_key: string;
  transformed_image_url: string | null;
  transformed_image_key: string | null;
  print_ready_url: string | null;
  print_ready_key: string | null;
  thumbnail_url: string | null;

  // Configuration
  style: StyleType;
  size: SizeType;
  paper_type: PaperType;
  frame_type: FrameType;
  quantity: number;

  // Pricing (in agorot)
  base_price: number;
  paper_addon: number;
  frame_addon: number;
  item_total: number;

  // AI transformation
  ai_transformation_id: string | null;
  transformation_status: string;
  transformation_error: string | null;

  created_at: string;
}

export interface DbPayment {
  id: string;
  order_id: string;

  // Payment details
  provider: PaymentProvider;
  status: PaymentStatus;

  // Provider references
  external_id: string | null;
  external_transaction_id: string | null;

  // Amount (in agorot)
  amount: number;
  currency: string;

  // Installments
  installments: number;

  // Card info
  card_last_four: string | null;
  card_brand: string | null;

  // Bit payment
  bit_payment_id: string | null;

  // Error handling
  error_code: string | null;
  error_message: string | null;

  // Webhook data
  webhook_payload: Record<string, unknown> | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  refunded_at: string | null;
}

export interface DbShipment {
  id: string;
  order_id: string;

  // Carrier info
  carrier: string;
  carrier_name: string | null;
  tracking_number: string | null;
  tracking_url: string | null;

  // Status
  status: ShipmentStatus;

  // Shipping details
  shipping_method: string | null;
  estimated_delivery_date: string | null;
  actual_delivery_date: string | null;

  // Package info
  weight_grams: number | null;
  dimensions_cm: DimensionsJson | null;

  // Recipient
  recipient_name: string | null;
  recipient_phone: string | null;
  delivery_address: AddressJson | null;

  // Delivery notes
  delivery_instructions: string | null;
  signature_required: boolean;

  // Timestamps
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface DbDiscountCode {
  id: string;
  code: string;
  description: string | null;

  // Discount type
  discount_type: 'percentage' | 'fixed';
  discount_value: number;

  // Limits
  min_order_amount: number | null;
  max_discount_amount: number | null;
  max_uses: number | null;
  max_uses_per_user: number;

  // Tracking
  times_used: number;

  // Validity
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;

  created_at: string;
}

export interface DbOrderStatusHistory {
  id: string;
  order_id: string;
  status: OrderStatus;
  notes: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface DbNotification {
  id: string;
  order_id: string | null;
  user_id: string | null;

  // Notification type
  type: 'email' | 'whatsapp' | 'sms';
  template: string;

  // Recipient
  recipient: string;

  // Content
  subject: string | null;
  body: string | null;

  // Status
  status: 'pending' | 'sent' | 'failed';
  sent_at: string | null;
  error_message: string | null;

  // Provider response
  external_id: string | null;

  created_at: string;
}

export interface DbProductPrice {
  id: string;
  size: SizeType;
  base_price: number;

  // Paper addons
  paper_matte_addon: number;
  paper_glossy_addon: number;
  paper_canvas_addon: number;

  // Frame addons
  frame_none_addon: number;
  frame_black_addon: number;
  frame_white_addon: number;
  frame_oak_addon: number;

  // Shipping
  shipping_standard: number;
  shipping_express: number;

  is_active: boolean;
  valid_from: string;
  valid_until: string | null;

  created_at: string;
}

// ============================================================================
// JSON TYPES (for JSONB columns)
// ============================================================================

export interface AddressJson {
  name: string;
  street: string;
  apartment?: string;
  city: string;
  postal_code?: string;
  country: string;
  phone?: string;
}

export interface DimensionsJson {
  length: number;
  width: number;
  height: number;
}

// ============================================================================
// SUPABASE DATABASE TYPE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: DbProfile;
        Insert: Omit<DbProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DbProfile, 'id' | 'created_at'>>;
      };
      addresses: {
        Row: DbAddress;
        Insert: Omit<DbAddress, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DbAddress, 'id' | 'created_at'>>;
      };
      orders: {
        Row: DbOrder;
        Insert: Omit<DbOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DbOrder, 'id' | 'order_number' | 'created_at'>>;
      };
      order_items: {
        Row: DbOrderItem;
        Insert: Omit<DbOrderItem, 'id' | 'created_at'>;
        Update: Partial<Omit<DbOrderItem, 'id' | 'created_at'>>;
      };
      payments: {
        Row: DbPayment;
        Insert: Omit<DbPayment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DbPayment, 'id' | 'created_at'>>;
      };
      shipments: {
        Row: DbShipment;
        Insert: Omit<DbShipment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DbShipment, 'id' | 'created_at'>>;
      };
      discount_codes: {
        Row: DbDiscountCode;
        Insert: Omit<DbDiscountCode, 'id' | 'times_used' | 'created_at'>;
        Update: Partial<Omit<DbDiscountCode, 'id' | 'created_at'>>;
      };
      order_status_history: {
        Row: DbOrderStatusHistory;
        Insert: Omit<DbOrderStatusHistory, 'id' | 'created_at'>;
        Update: never;
      };
      notifications: {
        Row: DbNotification;
        Insert: Omit<DbNotification, 'id' | 'created_at'>;
        Update: Partial<Omit<DbNotification, 'id' | 'created_at'>>;
      };
      product_prices: {
        Row: DbProductPrice;
        Insert: Omit<DbProductPrice, 'id' | 'created_at'>;
        Update: Partial<Omit<DbProductPrice, 'id' | 'created_at'>>;
      };
    };
    Enums: {
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      payment_provider: PaymentProvider;
      shipment_status: ShipmentStatus;
      style_type: StyleType;
      size_type: SizeType;
      paper_type: PaperType;
      frame_type: FrameType;
    };
  };
}

// ============================================================================
// HELPER TYPES
// ============================================================================

// Order with related items
export interface OrderWithItems extends DbOrder {
  items: DbOrderItem[];
}

// Order with all relations
export interface OrderFull extends DbOrder {
  items: DbOrderItem[];
  payment: DbPayment | null;
  shipment: DbShipment | null;
  status_history: DbOrderStatusHistory[];
}

// Price in ILS (for display)
export function agorotToILS(agorot: number): number {
  return agorot / 100;
}

// Format price for display
export function formatPrice(agorot: number): string {
  return `₪${agorotToILS(agorot).toFixed(0)}`;
}
