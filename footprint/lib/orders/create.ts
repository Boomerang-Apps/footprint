/**
 * Order Creation Service
 *
 * Creates order records in the database after successful payments.
 * Handles order number generation and confirmation email triggering.
 */

import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

// ============================================================================
// Types
// ============================================================================

/**
 * Order item in the order
 */
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  style?: string;
  size?: string;
  paper?: string;
  frame?: string;
}

/**
 * Shipping address for the order
 */
export interface ShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

/**
 * Parameters for creating an order
 */
export interface CreateOrderParams {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentProvider: 'payplus';
  paymentTransactionId: string;
  isGift?: boolean;
  giftMessage?: string;
  hasPassepartout?: boolean;
  /** Order status — defaults to 'paid'. Use 'pending_payment' for pre-created orders. */
  status?: 'paid' | 'pending_payment';
}

/**
 * Result of order creation
 */
export interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
}

// ============================================================================
// Order Number Generation
// ============================================================================

/**
 * Generates a unique order number in format FP-YYYYMMDD-XXXX
 *
 * @param date - Date to generate order number for
 * @returns Unique order number string
 */
export async function generateOrderNumber(date: Date): Promise<string> {
  const supabase = createAdminClient();

  // Format date as YYYYMMDD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const datePrefix = `FP-${year}${month}${day}`;

  // Find the last order number for today
  const { data, error } = await supabase
    .from('orders')
    .select('order_number')
    .like('order_number', `${datePrefix}-%`)
    .order('order_number', { ascending: false })
    .limit(1)
    .single();

  let sequence = 1;

  if (data && !error) {
    // Extract sequence from last order number
    const lastSequence = parseInt(data.order_number.split('-')[2], 10);
    sequence = lastSequence + 1;
  }

  // Format sequence as 4-digit number
  const sequenceStr = String(sequence).padStart(4, '0');

  return `${datePrefix}-${sequenceStr}`;
}

// ============================================================================
// Order Creation
// ============================================================================

/**
 * Creates an order in the database after successful payment.
 *
 * Inserts into `orders` table (header) + `order_items` table (line items).
 * Customer name/phone are stored inside shipping_address JSON.
 * Guest email stored in guest_email column. Prices stored in agorot.
 *
 * @param params - Order creation parameters
 * @returns Order ID and order number
 * @throws Error if validation fails or database operation fails
 */
export async function createOrder(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  // Validate required fields
  if (!params.customerName || params.customerName.trim() === '') {
    throw new Error('Customer name is required');
  }

  if (!params.customerEmail || params.customerEmail.trim() === '') {
    throw new Error('Customer email is required');
  }

  if (!params.items || params.items.length === 0) {
    throw new Error('At least one item is required');
  }

  if (params.total <= 0) {
    throw new Error('Total must be greater than 0');
  }

  if (!params.paymentTransactionId || params.paymentTransactionId.trim() === '') {
    throw new Error('Payment transaction ID is required');
  }

  const supabase = createAdminClient();

  // Build customer_notes JSON with transaction ID and passepartout flag
  const customerNotesJson = JSON.stringify({
    txn: params.paymentTransactionId,
    passepartout: params.hasPassepartout || false,
  });

  // Check for existing order with same transaction ID (idempotency)
  // Use customer_notes JSON to store transaction ID since no dedicated column exists
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id, order_number')
    .eq('customer_notes', customerNotesJson)
    .single();

  if (existingOrder) {
    // Return existing order for idempotency
    return {
      orderId: existingOrder.id,
      orderNumber: existingOrder.order_number,
    };
  }

  // Generate unique order number
  const orderNumber = await generateOrderNumber(new Date());

  // Convert prices to agorot if they appear to be in shekel (< 10000)
  const toAgorot = (v: number): number => v < 10000 ? Math.round(v * 100) : v;

  // Build shipping_address with customer info embedded
  const shippingAddress = {
    name: params.customerName,
    email: params.customerEmail,
    phone: params.customerPhone || '',
    street: params.shippingAddress.street,
    city: params.shippingAddress.city,
    postalCode: params.shippingAddress.postalCode,
  };

  // Insert order header
  const orderStatus = params.status || 'paid';
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: params.userId || null,
      guest_email: params.userId ? null : params.customerEmail,
      order_number: orderNumber,
      status: orderStatus,
      subtotal: toAgorot(params.subtotal),
      shipping_cost: toAgorot(params.shipping),
      discount_amount: 0,
      tax_amount: 0,
      total: toAgorot(params.total),
      currency: 'ILS',
      shipping_address: shippingAddress,
      is_gift: params.isGift || false,
      gift_message: params.giftMessage || null,
      paid_at: orderStatus === 'paid' ? new Date().toISOString() : null,
      customer_notes: customerNotesJson,
    })
    .select('id, order_number')
    .single();

  if (error || !data) {
    logger.error('Failed to create order', error);
    throw new Error(`Failed to create order: ${error?.message || 'Unknown error'}`);
  }

  // Insert order items
  // DB uses enums — normalize display names to valid enum values
  const VALID_STYLES = ['pop_art', 'watercolor', 'line_art', 'oil_painting', 'romantic', 'comic_book', 'vintage', 'original'];
  const VALID_PAPERS = ['matte', 'glossy', 'canvas'];
  const VALID_FRAMES = ['none', 'black', 'white', 'oak'];

  const normalizeEnum = (value: string | undefined, valid: string[], fallback: string): string => {
    if (!value) return fallback;
    const lower = value.toLowerCase().replace(/\s+/g, '_');
    if (valid.includes(lower)) return lower;
    if (valid.includes(value)) return value;
    return fallback;
  };

  // Derive a storage key from URL (or use placeholder for external URLs)
  const deriveKey = (url: string | undefined): string => {
    if (!url) return 'pending';
    try {
      const pathname = new URL(url).pathname;
      return pathname.replace(/^\//, '') || 'external';
    } catch {
      return 'external';
    }
  };

  const itemRows = params.items.map((item) => ({
    order_id: data.id,
    original_image_url: item.imageUrl || null,
    original_image_key: deriveKey(item.imageUrl),
    transformed_image_url: item.imageUrl || null,
    transformed_image_key: deriveKey(item.imageUrl),
    style: normalizeEnum(item.style, VALID_STYLES, 'original'),
    size: item.size || 'A4',
    paper_type: normalizeEnum(item.paper, VALID_PAPERS, 'matte'),
    frame_type: normalizeEnum(item.frame, VALID_FRAMES, 'none'),
    quantity: item.quantity,
    base_price: toAgorot(item.price),
    paper_addon: 0,
    frame_addon: 0,
    item_total: toAgorot(item.price) * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemRows);

  if (itemsError) {
    logger.error('Failed to insert order items', itemsError);
    // Order header was created — don't throw, just log
  }

  return {
    orderId: data.id,
    orderNumber: data.order_number,
  };
}

// ============================================================================
// Confirmation Email
// ============================================================================

/**
 * Triggers the confirmation email for an order
 *
 * This is a fire-and-forget operation - it logs errors but doesn't throw.
 * The order creation should succeed even if the email fails.
 *
 * @param orderId - The order ID to send confirmation for
 */
export async function triggerConfirmationEmail(orderId: string): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/orders/${orderId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error(
        `Failed to send confirmation email for order ${orderId}`,
        errorData.error || response.statusText
      );
    }
  } catch (error) {
    logger.error(`Error triggering confirmation email for order ${orderId}`, error);
  }
}

// ============================================================================
// New Order Notification (Internal)
// ============================================================================

/**
 * Triggers a notification email to the shop owner for a new order.
 *
 * This is a fire-and-forget operation - it logs errors but doesn't throw.
 *
 * @param orderId - The order ID to notify about
 */
export async function triggerNewOrderNotification(orderId: string): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/orders/${orderId}/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error(
        `Failed to send order notification for order ${orderId}`,
        errorData.error || response.statusText
      );
    }
  } catch (error) {
    logger.error(`Error triggering order notification for order ${orderId}`, error);
  }
}
