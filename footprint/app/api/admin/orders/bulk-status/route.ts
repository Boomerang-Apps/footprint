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
import { checkRateLimit } from '@/lib/rate-limit';
import {
  isValidFulfillmentStatus,
  validateBatchTransitions,
  type FulfillmentStatus,
} from '@/lib/fulfillment/status-transitions';

const MAX_BATCH_SIZE = 100;

interface BulkStatusRequest {
  orderIds: string[];
  status: FulfillmentStatus;
}

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
  // 1. Rate limiting (strict for bulk operations)
  const rateLimitResult = await checkRateLimit('strict', request);
  if (rateLimitResult) {
    return rateLimitResult as NextResponse<ErrorResponse>;
  }

  try {
    // 2. Authentication check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'נדרשת הרשאת מנהל' },
        { status: 401 }
      );
    }

    // 3. Admin authorization check
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'נדרשת הרשאת מנהל' },
        { status: 403 }
      );
    }

    // 4. Parse request body
    let body: BulkStatusRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'גוף בקשה לא תקין' },
        { status: 400 }
      );
    }

    // 5. Validate request fields
    if (!body.orderIds || !Array.isArray(body.orderIds)) {
      return NextResponse.json(
        { error: 'חסר שדה orderIds' },
        { status: 400 }
      );
    }

    if (body.orderIds.length === 0) {
      return NextResponse.json(
        { error: 'רשימת orderIds ריקה' },
        { status: 400 }
      );
    }

    if (body.orderIds.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `מקסימום ${MAX_BATCH_SIZE} הזמנות בפעולה אחת` },
        { status: 400 }
      );
    }

    if (!body.status) {
      return NextResponse.json(
        { error: 'חסר שדה status' },
        { status: 400 }
      );
    }

    if (!isValidFulfillmentStatus(body.status)) {
      return NextResponse.json(
        { error: 'סטטוס לא תקין' },
        { status: 400 }
      );
    }

    // 6. Fetch orders to validate transitions
    const { data: orders, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, order_number')
      .in('id', body.orderIds);

    if (fetchError) {
      console.error('Bulk status fetch error:', fetchError);
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

    // 7. Validate status transitions
    const ordersWithStatus = orders.map((o) => ({
      id: o.id,
      currentStatus: o.status as FulfillmentStatus,
    }));

    const { valid: validOrderIds, invalid: invalidOrders } = validateBatchTransitions(
      ordersWithStatus,
      body.status
    );

    // 8. Update valid orders
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
        console.error('Bulk status update error:', updateError);
        return NextResponse.json(
          { error: 'שגיאת מערכת בעדכון הזמנות' },
          { status: 500 }
        );
      }

      successCount = validOrderIds.length;

      // 9. Record status history for each updated order
      const historyEntries = validOrderIds.map((orderId) => ({
        order_id: orderId,
        status: body.status,
        changed_by: user.id,
        changed_at: new Date().toISOString(),
        note: 'Bulk status update',
      }));

      await supabase.from('order_status_history').insert(historyEntries);

      // 10. Audit log
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

    // 11. Return results
    return NextResponse.json({
      success: successCount,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    console.error('Bulk status error:', error);
    return NextResponse.json(
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}
