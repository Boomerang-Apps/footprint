/**
 * PATCH /api/admin/orders/[id]/status
 *
 * Updates order status with validation, history tracking, and customer notification.
 * Admin-only endpoint.
 *
 * Request body:
 * {
 *   "status": "shipped",
 *   "note": "Optional admin note"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "order": {
 *     "id": "...",
 *     "status": "shipped",
 *     "updatedAt": "2025-12-25T12:00:00Z"
 *   },
 *   "notification": {
 *     "sent": true,
 *     "to": "customer@example.com"
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  isValidStatusTransition,
  createStatusHistoryEntry,
  OrderStatus,
} from '@/lib/orders/status';
import { sendStatusUpdateEmail } from '@/lib/email/resend';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// Valid order statuses
const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'paid',
  'processing',
  'printing',
  'shipped',
  'delivered',
  'cancelled',
];

interface StatusUpdateRequest {
  status: OrderStatus;
  note?: string;
}

interface StatusUpdateResponse {
  success: boolean;
  order: {
    id: string;
    status: OrderStatus;
    updatedAt: string;
  };
  notification: {
    sent: boolean;
    to?: string;
    error?: string;
  };
}

interface ErrorResponse {
  error: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<StatusUpdateResponse | ErrorResponse>> {
  // Rate limiting: general limit for admin routes
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

    // 2. Check admin role
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    let body: StatusUpdateRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // 4. Validate status field exists
    if (!body.status) {
      return NextResponse.json(
        { error: 'Missing required field: status' },
        { status: 400 }
      );
    }

    // 5. Validate status value
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status value. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // 6. Fetch existing order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, customer_email, customer_name, status_history')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 7. Validate status transition
    const currentStatus = order.status as OrderStatus;
    const newStatus = body.status;

    if (!isValidStatusTransition(currentStatus, newStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from '${currentStatus}' to '${newStatus}'` },
        { status: 400 }
      );
    }

    // 8. Create status history entry
    const historyEntry = createStatusHistoryEntry(
      newStatus,
      user.id,
      body.note
    );

    const existingHistory = order.status_history || [];
    const updatedHistory = [...existingHistory, historyEntry];

    // 9. Update order in database
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        status_history: updatedHistory,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('id, status, updated_at')
      .single();

    if (updateError || !updatedOrder) {
      logger.error('Failed to update order', updateError);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // 10. Send customer notification email
    let notificationResult = {
      sent: false as boolean,
      to: order.customer_email as string | undefined,
      error: undefined as string | undefined,
    };

    try {
      const emailResult = await sendStatusUpdateEmail({
        to: order.customer_email,
        customerName: order.customer_name,
        orderId: order.id,
        newStatus: newStatus,
        note: body.note,
      });

      notificationResult = {
        sent: emailResult.success,
        to: order.customer_email,
        error: emailResult.error,
      };
    } catch (emailError) {
      logger.error('Failed to send status update email', emailError);
      notificationResult = {
        sent: false,
        to: order.customer_email,
        error: emailError instanceof Error ? emailError.message : 'Unknown email error',
      };
    }

    // 11. Return success response
    return NextResponse.json({
      success: true,
      order: {
        id: updatedOrder.id,
        status: updatedOrder.status as OrderStatus,
        updatedAt: updatedOrder.updated_at,
      },
      notification: notificationResult,
    });
  } catch (error) {
    logger.error('Status update error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
