/**
 * GET /api/cron/expire-pending-orders
 *
 * Cron job that expires pending orders older than 15 minutes.
 * Runs every 5 minutes via Vercel Cron.
 * Requires CRON_SECRET authorization header.
 */

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

const PENDING_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function GET(request: Request): Promise<NextResponse> {
  // 1. Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const supabase = createAdminClient();
    const cutoff = new Date(Date.now() - PENDING_TIMEOUT_MS).toISOString();

    // 2. Find expired pending orders
    const { data: expiredOrders, error: selectError } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('status', 'pending')
      .lt('created_at', cutoff);

    if (selectError) {
      logger.error('Failed to query expired orders', selectError);
      return NextResponse.json(
        { error: 'Failed to query orders' },
        { status: 500 }
      );
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      logger.info('No pending orders to expire');
      return NextResponse.json({ success: true, expired: 0 });
    }

    // 3. Cancel each expired order
    const orderIds = expiredOrders.map((o) => o.id);
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled' as const,
        cancelled_at: new Date().toISOString(),
        admin_notes: 'Auto-expired: payment not completed within 15 minutes',
      })
      .in('id', orderIds);

    if (updateError) {
      logger.error('Failed to expire orders', updateError);
      return NextResponse.json(
        { error: 'Failed to update orders' },
        { status: 500 }
      );
    }

    logger.info(
      `Expired ${expiredOrders.length} pending orders: ${expiredOrders.map((o) => o.order_number).join(', ')}`
    );

    return NextResponse.json({
      success: true,
      expired: expiredOrders.length,
    });
  } catch (error) {
    logger.error('Cron expire-pending-orders error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
