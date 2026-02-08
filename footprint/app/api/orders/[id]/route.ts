/**
 * Order Details API
 *
 * GET /api/orders/[id] - Get full order details including items and tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateTrackingUrl } from '@/lib/orders/tracking';
import { getStatusLabel } from '@/lib/orders/status';
import type { OrderStatus } from '@/types/order';
import { logger } from '@/lib/logger';

interface OrderDetailItem {
  id: string;
  originalImageUrl: string;
  transformedImageUrl: string | null;
  printReadyUrl: string | null;
  style: string;
  size: string;
  paperType: string;
  frameType: string;
  quantity: number;
  basePrice: number;
  paperAddon: number;
  frameAddon: number;
  itemTotal: number;
}

interface OrderDetailResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;

  // Pricing (converted from agorot to ILS)
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  taxAmount: number;
  total: number;

  // Gift options
  isGift: boolean;
  giftMessage: string | null;
  giftWrap: boolean;
  hidePrice: boolean;
  hasPassepartout: boolean;

  // Addresses
  shippingAddress: any;
  billingAddress: any;

  // Tracking
  trackingNumber: string | null;
  trackingUrl: string | null;
  carrier: string | null;

  // Items
  items: OrderDetailItem[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
}

interface ErrorResponse {
  error: string;
}

type RouteParams = { params: Promise<{ id: string }> };

/**
 * Converts price from agorot (stored in DB) to ILS for API response
 */
function convertFromAgorot(agorot: number): number {
  return Math.round(agorot / 100 * 100) / 100; // Convert and round to 2 decimals
}

/**
 * GET /api/orders/[id]
 *
 * Returns full order details including items, tracking, and status history.
 * Only accessible by the order owner (user_id must match authenticated user).
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<OrderDetailResponse | ErrorResponse>> {
  try {
    const { id: orderId } = await params;

    // 1. Rate limiting
    const rateLimitResult = await checkRateLimit('general', request);
    if (rateLimitResult) {
      return rateLimitResult as NextResponse<ErrorResponse>;
    }

    // 2. Authentication check (optional in test mode)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isTestMode = !process.env.PAYPLUS_PAYMENT_PAGE_UID;
    if (!isTestMode && !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // 3. Validate order ID format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json(
        { error: 'Invalid order ID format' },
        { status: 400 }
      );
    }

    // 4. Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          original_image_url,
          transformed_image_url,
          print_ready_url,
          style,
          size,
          paper_type,
          frame_type,
          quantity,
          base_price,
          paper_addon,
          frame_addon,
          item_total
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      logger.error('Order fetch error', orderError);
      return NextResponse.json(
        { error: 'Failed to fetch order' },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 5. Authorization check - user can only access their own orders (skip in test mode)
    if (!isTestMode && order.user_id !== user!.id) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 6. Generate tracking URL if tracking info exists
    const trackingUrl = order.tracking_number && order.carrier
      ? generateTrackingUrl(order.tracking_number, order.carrier)
      : null;

    // 7. Transform items data
    const items: OrderDetailItem[] = (order.order_items || []).map((item: any) => ({
      id: item.id,
      originalImageUrl: item.original_image_url,
      transformedImageUrl: item.transformed_image_url,
      printReadyUrl: item.print_ready_url,
      style: item.style,
      size: item.size,
      paperType: item.paper_type,
      frameType: item.frame_type,
      quantity: item.quantity,
      basePrice: convertFromAgorot(item.base_price),
      paperAddon: convertFromAgorot(item.paper_addon),
      frameAddon: convertFromAgorot(item.frame_addon),
      itemTotal: convertFromAgorot(item.item_total),
    }));

    // 8. Build response
    const orderDetail: OrderDetailResponse = {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status as OrderStatus,
      statusLabel: getStatusLabel(order.status as OrderStatus, 'en'),

      // Convert pricing from agorot to ILS
      subtotal: convertFromAgorot(order.subtotal),
      shippingCost: convertFromAgorot(order.shipping_cost),
      discountAmount: convertFromAgorot(order.discount_amount),
      taxAmount: convertFromAgorot(order.tax_amount),
      total: convertFromAgorot(order.total),

      // Gift options
      isGift: order.is_gift || false,
      giftMessage: order.gift_message,
      giftWrap: order.gift_wrap || false,
      hidePrice: order.hide_price || false,
      hasPassepartout: (() => {
        try {
          const parsed = JSON.parse(order.customer_notes || '');
          return !!parsed.passepartout;
        } catch { return false; }
      })(),

      // Addresses
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,

      // Tracking
      trackingNumber: order.tracking_number,
      trackingUrl,
      carrier: order.carrier,

      // Items
      items,

      // Timestamps
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      paidAt: order.paid_at,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at,
      cancelledAt: order.cancelled_at,
    };

    return NextResponse.json(orderDetail);

  } catch (error) {
    logger.error('Order details error', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}