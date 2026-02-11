/**
 * POST /api/orders/[id]/finalize
 *
 * Finalizes a pending_payment order after PayPlus redirect.
 * Updates status to 'paid', sets paid_at, and triggers emails.
 * Idempotent: if order is already 'paid', returns success without duplicate emails.
 *
 * Called from the iframe-callback page when PayPlus uses top-level navigation.
 * No auth required — uses admin client (similar to webhook pattern).
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

    // Only finalize pending_payment orders
    if (order.status !== 'pending_payment') {
      return NextResponse.json(
        { error: `Cannot finalize order with status: ${order.status}` },
        { status: 400 }
      );
    }

    // Update to paid
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
