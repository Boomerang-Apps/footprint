/**
 * Order Creation Service
 *
 * Creates order records in the database after successful payments.
 * Handles order number generation and confirmation email triggering.
 */

import { createClient } from '@/lib/supabase/server';

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
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentProvider: 'stripe' | 'payplus';
  paymentTransactionId: string;
  isGift?: boolean;
  giftMessage?: string;
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
  const supabase = await createClient();

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
 * Creates an order in the database after successful payment
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

  const supabase = await createClient();

  // Check for existing order with same transaction ID (idempotency)
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id, order_number')
    .eq('payment_transaction_id', params.paymentTransactionId)
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

  // Insert order into database
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: params.userId || null,
      order_number: orderNumber,
      status: 'paid',
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      items: params.items,
      subtotal: params.subtotal,
      shipping: params.shipping,
      total: params.total,
      shipping_address: params.shippingAddress,
      payment_provider: params.paymentProvider,
      payment_transaction_id: params.paymentTransactionId,
      is_gift: params.isGift || false,
      gift_message: params.giftMessage || null,
    })
    .select('id, order_number')
    .single();

  if (error || !data) {
    console.error('Failed to create order:', error);
    throw new Error(`Failed to create order: ${error?.message || 'Unknown error'}`);
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
      console.error(
        `Failed to send confirmation email for order ${orderId}:`,
        errorData.error || response.statusText
      );
    }
  } catch (error) {
    console.error(`Error triggering confirmation email for order ${orderId}:`, error);
  }
}
