/**
 * POST /api/orders/[id]/notify
 *
 * Sends a new-order notification email to the shop owner (orders@footprint.co.il).
 * Called internally (fire-and-forget) from the webhook handler after order creation.
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendNewOrderNotificationEmail } from '@/lib/email/resend';

// ============================================================================
// Types matching actual Supabase schema
// ============================================================================

interface ShippingAddressJson {
  name?: string;
  email?: string;
  phone?: string;
  street: string;
  city: string;
  postalCode: string;
}

interface OrderItemRow {
  original_image_url: string | null;
  transformed_image_url: string | null;
  style: string;
  size: string;
  paper_type: string;
  frame_type: string;
  quantity: number;
  base_price: number;
  item_total: number;
}

interface OrderRow {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  shipping_address: ShippingAddressJson;
  is_gift: boolean;
  gift_message: string | null;
  customer_notes: string | null;
  created_at: string | null;
  order_items: OrderItemRow[];
}

interface NotifyResponse {
  success: boolean;
  emailId?: string;
}

interface ErrorResponse {
  error: string;
}

type RouteParams = { params: Promise<{ id: string }> };

const ORDER_SELECT = 'id, order_number, user_id, guest_email, status, subtotal, shipping_cost, total, shipping_address, is_gift, gift_message, customer_notes, created_at, order_items(original_image_url, transformed_image_url, style, size, paper_type, frame_type, quantity, base_price, item_total)';

/** Convert agorot (DB) to shekel (display) */
const toShekel = (agorot: number): number => Math.round(agorot) / 100;

/** Parse hasPassepartout from customer_notes JSON */
function parsePassepartout(customerNotes: string | null): boolean {
  if (!customerNotes) return false;
  try {
    const parsed = JSON.parse(customerNotes);
    return !!parsed.passepartout;
  } catch {
    return false;
  }
}

export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<NotifyResponse | ErrorResponse>> {
  // Rate limiting: 5 per minute
  const rateLimited = await checkRateLimit('checkout', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    const { id: orderId } = await params;

    const supabase = createAdminClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const typedOrder = order as unknown as OrderRow;
    const addr = typedOrder.shipping_address;
    const customerEmail = addr.email || typedOrder.guest_email || '';
    const customerName = addr.name || 'Customer';
    const hasPassepartout = parsePassepartout(typedOrder.customer_notes);

    // Map order_items to email-friendly format
    const items = (typedOrder.order_items || []).map(item => ({
      name: `${item.style} - ${item.size}`,
      quantity: item.quantity,
      price: toShekel(item.base_price),
      imageUrl: item.transformed_image_url || item.original_image_url || undefined,
      style: item.style,
      size: item.size,
      paper: item.paper_type,
      frame: item.frame_type,
      hasPassepartout,
    }));

    const emailResult = await sendNewOrderNotificationEmail({
      orderNumber: typedOrder.order_number,
      customerName,
      customerEmail,
      customerPhone: addr.phone || undefined,
      userId: typedOrder.user_id || undefined,
      items,
      subtotal: toShekel(typedOrder.subtotal),
      shipping: toShekel(typedOrder.shipping_cost),
      total: toShekel(typedOrder.total),
      shippingAddress: {
        street: addr.street,
        city: addr.city,
        postalCode: addr.postalCode,
        country: 'Israel',
      },
      paymentProvider: 'payplus',
      isGift: typedOrder.is_gift,
      giftMessage: typedOrder.gift_message || undefined,
      createdAt: typedOrder.created_at || undefined,
    });

    if (!emailResult.success) {
      console.error('Failed to send order notification email:', emailResult.error);
      return NextResponse.json(
        { error: `Failed to send notification: ${emailResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: emailResult.emailId,
    });
  } catch (error) {
    console.error('Notify route error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
