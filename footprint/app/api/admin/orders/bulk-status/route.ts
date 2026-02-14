/**
 * POST /api/admin/orders/bulk-status
 *
 * Bulk update order fulfillment status for multiple orders.
 * Admin-only endpoint with validation and audit logging.
 *
 * Request body:
 * {
 *   "orderIds": ["order-1", "order-2"],
 *   "status": "printing"
 * }
 *
 * Response:
 * {
 *   "success": 2,
 *   "failed": 0,
 *   "errors": []
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/auth/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { bulkStatusSchema, parseRequestBody } from '@/lib/validation/admin';
import {
  validateBatchTransitions,
  type FulfillmentStatus,
} from '@/lib/fulfillment/status-transitions';

interface BulkStatusResponse {
  success: number;
  failed: number;
  errors: Array<{ orderId: string; reason: string }>;
}

interface ErrorResponse {
  error: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<BulkStatusResponse | ErrorResponse>> {
  // 1. Rate limiting (10/min for bulk operations — AC-013)
  const rateLimitResult = await checkRateLimit('bulk', request);
  if (rateLimitResult) {
    return rateLimitResult as NextResponse<ErrorResponse>;
  }

  try {
    // 2. Admin authorization (DB-backed)
    const auth = await verifyAdmin();
    if (!auth.isAuthorized) return auth.error!;
    const user = auth.user!;

    const supabase = await createClient();

    // 3. Parse and validate request body
    const parsed = await parseRequestBody(request, bulkStatusSchema);
    if (parsed.error) return parsed.error as NextResponse<ErrorResponse>;
    const body = parsed.data;

    // 4. Fetch orders to validate transitions
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, order_number')
      .in('id', body.orderIds);

    if (fetchError) {
      logger.error('Bulk status fetch error', fetchError);
      return NextResponse.json(
        { error: 'שגיאת מערכת' },
        { status: 500 }
      );
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: 'לא נמצאו הזמנות' },
        { status: 404 }
      );
    }

    // 5. Validate status transitions
    const ordersWithStatus = orders.map((o) => ({
      id: o.id,
      currentStatus: o.status as FulfillmentStatus,
    }));

    const { valid: validOrderIds, invalid: invalidOrders } = validateBatchTransitions(
      ordersWithStatus,
      body.status
    );

    // 6. Update valid orders
    let successCount = 0;
    const errors = [...invalidOrders];

    if (validOrderIds.length > 0) {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: body.status,
          updated_at: new Date().toISOString(),
        })
        .in('id', validOrderIds);

      if (updateError) {
        logger.error('Bulk status update error', updateError);
        return NextResponse.json(
          { error: 'שגיאת מערכת בעדכון הזמנות' },
          { status: 500 }
        );
      }

      successCount = validOrderIds.length;

      // 7. Record status history for each updated order
      const historyEntries = validOrderIds.map((orderId) => ({
        order_id: orderId,
        status: body.status,
        changed_by: user.id,
        changed_at: new Date().toISOString(),
        note: 'Bulk status update',
      }));

      await supabase.from('order_status_history').insert(historyEntries);

      // 8. Audit log
      await supabase.from('admin_audit_log').insert({
        admin_id: user.id,
        action: 'bulk_status_update',
        details: {
          orderIds: validOrderIds,
          newStatus: body.status,
          totalAffected: validOrderIds.length,
        },
        created_at: new Date().toISOString(),
      });
    }

    // 9. Return results
    return NextResponse.json({
      success: successCount,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    logger.error('Bulk status error', error);
    return NextResponse.json(
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}
