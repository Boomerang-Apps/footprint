/**
 * POST /api/admin/orders/[id]/refund
 *
 * Admin-only endpoint to process full or partial refunds via PayPlus.
 * Requires admin auth, rate-limited to 3 requests/minute.
 */

import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/server';
import { processRefund } from '@/lib/payments/refund';
import { createPaymentRecord } from '@/lib/payments/record';
import { logger } from '@/lib/logger';
import { refundSchema, parseRequestBody } from '@/lib/validation/admin';

type RouteParams = { params: Promise<{ id: string }> };

const REFUNDABLE_STATUSES = ['paid', 'processing', 'printing', 'shipped'];

export async function POST(
  request: Request,
  { params }: RouteParams
): Promise<NextResponse> {
  // 1. Rate limit
  const rateLimited = await checkRateLimit('strict', request);
  if (rateLimited) return rateLimited;

  // 2. Admin auth
  const auth = await verifyAdmin();
  if (!auth.isAuthorized || auth.error) {
    return auth.error!;
  }

  try {
    const { id: orderId } = await params;

    // 3. Parse and validate body
    const parsed = await parseRequestBody(request, refundSchema);
    if (parsed.error) return parsed.error;
    const { amount, reason } = parsed.data;

    const supabase = createAdminClient();

    // 4. Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 5. Check order is refundable
    if (!REFUNDABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot refund order with status: ${order.status}` },
        { status: 400 }
      );
    }

    // 6. Fetch succeeded payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, external_transaction_id, amount')
      .eq('order_id', orderId)
      .eq('status', 'succeeded')
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'No succeeded payment record found for this order' },
        { status: 400 }
      );
    }

    // 7. Validate amount
    if (amount > payment.amount) {
      return NextResponse.json(
        { error: `Refund amount (${amount}) exceeds payment amount (${payment.amount})` },
        { status: 400 }
      );
    }

    // 8. Call PayPlus refund API
    const refundResult = await processRefund({
      transactionUid: payment.external_transaction_id!,
      amount,
      reason,
    });

    if (!refundResult.success) {
      return NextResponse.json(
        { error: `Refund failed: ${refundResult.errorMessage}` },
        { status: 502 }
      );
    }

    const isFullRefund = amount === payment.amount;

    // 9. Update database
    if (isFullRefund) {
      // Full refund: update payment status + order status
      await supabase
        .from('payments')
        .update({
          status: 'refunded' as const,
          refunded_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      await supabase
        .from('orders')
        .update({ status: 'refunded' as const })
        .eq('id', orderId);
    } else {
      // Partial refund: insert negative payment record, don't change order status
      await createPaymentRecord({
        orderId,
        provider: 'payplus',
        status: 'refunded',
        amount: -amount,
        externalTransactionId: refundResult.refundTransactionUid || `refund-${Date.now()}`,
      });
    }

    logger.info(
      `Refund processed: order=${order.order_number}, amount=${amount}, full=${isFullRefund}, by=${auth.user!.email}`
    );

    return NextResponse.json({
      success: true,
      refundedAmount: amount,
      isPartialRefund: !isFullRefund,
    });
  } catch (error) {
    logger.error('Refund endpoint error', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}
