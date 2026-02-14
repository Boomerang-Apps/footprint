/**
 * POST /api/orders/[id]/finalize
 *
 * Finalizes a pending order after PayPlus redirect.
 * Updates status to 'paid' ONLY if a real payment record from the webhook exists.
 * Idempotent: if order is already 'paid', returns success without duplicate emails.
 *
 * Called from the iframe-callback page when PayPlus uses top-level navigation.
 * Security: payment is verified by checking that the webhook has already created
 * a succeeded payment record with a real PayPlus transaction_uid.
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import {
  triggerConfirmationEmail,
  triggerNewOrderNotification,
} from '@/lib/orders/create';
import { logger } from '@/lib/logger';

interface FinalizeResponse {
  success: boolean;
  orderId: string;
  orderNumber?: string;
  alreadyFinalized?: boolean;
  pendingPayment?: boolean;
}

interface ErrorResponse {
  error: string;
}

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(
  _request: Request,
  { params }: RouteParams
): Promise<NextResponse<FinalizeResponse | ErrorResponse>> {
  try {
    const { id: orderId } = await params;

    const supabase = createAdminClient();

    // Fetch order
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Already finalized — idempotent, no duplicate emails
    if (order.status === 'paid') {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
        alreadyFinalized: true,
      });
    }

    // Only finalize pending orders
    if (order.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot finalize order with status: ${order.status}` },
        { status: 400 }
      );
    }

    // Verify payment: a real succeeded payment record must exist from the webhook.
    // This prevents marking orders as paid without actual payment confirmation.
    const { data: payment } = await supabase
      .from('payments')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'succeeded')
      .single();

    if (!payment) {
      // Webhook hasn't arrived yet — tell the client to retry
      logger.info(
        `Finalize called but no payment record yet for order ${order.order_number}`
      );
      return NextResponse.json({
        success: false,
        orderId: order.id,
        orderNumber: order.order_number,
        pendingPayment: true,
      });
    }

    // Payment verified — update to paid
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      logger.error('Failed to finalize order', updateError);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    logger.info(`Order finalized: ${order.order_number} (${orderId})`);

    // Fire-and-forget email triggers
    triggerConfirmationEmail(orderId);
    triggerNewOrderNotification(orderId);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error) {
    logger.error('Finalize error', error);
    return NextResponse.json(
      { error: 'Failed to finalize order' },
      { status: 500 }
    );
  }
}
