/**
 * Order Confirmation API
 *
 * POST /api/orders/[id]/confirm - Send confirmation email to customer
 *   Called internally (fire-and-forget) from the webhook handler.
 *   No auth required — mirrors the notify route pattern.
 *
 * GET /api/orders/[id]/confirm - Get confirmation details + WhatsApp URL
 *   Requires auth + ownership (user-facing endpoint).
 */

import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  sendOrderConfirmationEmail,
  generateWhatsAppShareUrl,
} from '@/lib/email/resend';
import { logger } from '@/lib/logger';

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

interface ConfirmResponse {
  success: boolean;
  emailId?: string;
}

interface ConfirmDetailsResponse {
  orderNumber: string;
  status: string;
  items: { name: string; quantity: number; price: number; imageUrl?: string; style?: string; size?: string; paper?: string; frame?: string }[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: { street: string; city: string; postalCode: string; country: string };
  whatsappUrl: string;
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

/** Map order_items DB rows to email-friendly format */
function mapItems(rows: OrderItemRow[], hasPassepartout: boolean) {
  return rows.map(item => ({
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
}

/**
 * POST /api/orders/[id]/confirm
 *
 * Sends order confirmation email to the customer.
 * Called internally from the webhook — no auth required.
 */
export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<ConfirmResponse | ErrorResponse>> {
  // Rate limiting: 5 per minute (sends emails)
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

    const emailResult = await sendOrderConfirmationEmail({
      to: customerEmail,
      customerName,
      orderNumber: typedOrder.order_number,
      items: mapItems(typedOrder.order_items || [], hasPassepartout),
      subtotal: toShekel(typedOrder.subtotal),
      shipping: toShekel(typedOrder.shipping_cost),
      total: toShekel(typedOrder.total),
      shippingAddress: {
        street: addr.street,
        city: addr.city,
        postalCode: addr.postalCode,
        country: 'Israel',
      },
      customerPhone: addr.phone || undefined,
      isGift: typedOrder.is_gift,
      giftMessage: typedOrder.gift_message || undefined,
      createdAt: typedOrder.created_at || undefined,
    });

    if (!emailResult.success) {
      logger.error('Failed to send confirmation email', emailResult.error);
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: emailResult.emailId,
    });
  } catch (error) {
    logger.error('Confirmation error', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/orders/[id]/confirm
 *
 * Returns order confirmation details including WhatsApp share URL.
 * Requires auth + ownership (user-facing).
 */
export async function GET(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse<ConfirmDetailsResponse | ErrorResponse>> {
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    const { id: orderId } = await params;

    // 1. Verify authentication
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // 2. Get order with ownership check
    const { data: order, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const typedOrder = order as unknown as OrderRow;
    const addr = typedOrder.shipping_address;
    const hasPassepartoutGet = parsePassepartout(typedOrder.customer_notes);

    // 3. Generate WhatsApp share URL
    const whatsappUrl = generateWhatsAppShareUrl(typedOrder.order_number);

    return NextResponse.json({
      orderNumber: typedOrder.order_number,
      status: typedOrder.status,
      items: mapItems(typedOrder.order_items || [], hasPassepartoutGet),
      subtotal: toShekel(typedOrder.subtotal),
      shipping: toShekel(typedOrder.shipping_cost),
      total: toShekel(typedOrder.total),
      shippingAddress: {
        street: addr.street,
        city: addr.city,
        postalCode: addr.postalCode,
        country: 'Israel',
      },
      whatsappUrl,
    });
  } catch (error) {
    logger.error('Get confirmation error', error);
    return NextResponse.json(
      { error: 'Failed to get confirmation details' },
      { status: 500 }
    );
  }
}
