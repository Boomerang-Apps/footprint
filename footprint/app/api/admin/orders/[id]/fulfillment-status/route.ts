/**
 * PATCH /api/admin/orders/[id]/fulfillment-status
 *
 * Update a single order's fulfillment status.
 * Admin-only endpoint with validation and history tracking.
 *
 * Request body:
 * {
 *   "status": "printing",
 *   "note": "Optional note"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "order": {
 *     "id": "...",
 *     "status": "printing",
 *     "updatedAt": "..."
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import {
  isValidFulfillmentStatus,
  isValidFulfillmentTransition,
  getStatusLabel,
  type FulfillmentStatus,
} from '@/lib/fulfillment/status-transitions';

interface StatusUpdateRequest {
  status: FulfillmentStatus;
  note?: string;
}

interface StatusUpdateResponse {
  success: boolean;
  order: {
    id: string;
    status: FulfillmentStatus;
    updatedAt: string;
  };
}

interface ErrorResponse {
  error: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<StatusUpdateResponse | ErrorResponse>> {
  // 1. Rate limiting
  const rateLimitResult = await checkRateLimit('general', request);
  if (rateLimitResult) {
    return rateLimitResult as NextResponse<ErrorResponse>;
  }

  try {
    const { id: orderId } = await params;

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
    let body: StatusUpdateRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'גוף בקשה לא תקין' },
        { status: 400 }
      );
    }

    // 5. Validate status field
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

    // 6. Fetch existing order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, order_number')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      // Check for actual database/connection errors (have error code)
      if (fetchError?.code) {
        logger.error('Fulfillment status fetch error', fetchError);
        return NextResponse.json(
          { error: 'שגיאת מערכת' },
          { status: 500 }
        );
      }
      // Order not found
      return NextResponse.json(
        { error: 'הזמנה לא נמצאה' },
        { status: 404 }
      );
    }

    // 7. Validate status transition
    const currentStatus = order.status as FulfillmentStatus;
    const newStatus = body.status;

    if (!isValidFulfillmentTransition(currentStatus, newStatus)) {
      return NextResponse.json(
        {
          error: `מעבר סטטוס לא חוקי מ-'${getStatusLabel(currentStatus)}' ל-'${getStatusLabel(newStatus)}'`,
        },
        { status: 400 }
      );
    }

    // 8. Update order
    const updatedAt = new Date().toISOString();
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: updatedAt,
      })
      .eq('id', orderId)
      .select('id, status, updated_at')
      .single();

    if (updateError || !updatedOrder) {
      logger.error('Fulfillment status update error', updateError);
      return NextResponse.json(
        { error: 'שגיאת מערכת בעדכון הזמנה' },
        { status: 500 }
      );
    }

    // 9. Record status history
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      status: newStatus,
      previous_status: currentStatus,
      changed_by: user.id,
      changed_at: updatedAt,
      note: body.note || null,
    });

    // 10. Return success response
    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status as FulfillmentStatus,
        updatedAt: updatedOrder.updated_at,
      },
    });
  } catch (error) {
    logger.error('Fulfillment status error', error);
    return NextResponse.json(
      { error: 'שגיאת מערכת' },
      { status: 500 }
    );
  }
}
