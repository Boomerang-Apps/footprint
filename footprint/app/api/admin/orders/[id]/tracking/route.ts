/**
 * PATCH /api/admin/orders/[id]/tracking
 *
 * Adds tracking number to an order with carrier selection and customer notification.
 * Admin-only endpoint.
 *
 * Request body:
 * {
 *   "trackingNumber": "RR123456789IL",
 *   "carrier": "israel_post",
 *   "note": "Optional admin note"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "order": {
 *     "id": "...",
 *     "trackingNumber": "RR123456789IL",
 *     "carrier": "israel_post",
 *     "trackingUrl": "https://israelpost.co.il/...",
 *     "updatedAt": "2025-12-26T12:00:00Z"
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
  isValidCarrier,
  validateTrackingNumber,
  generateTrackingUrl,
  CarrierCode,
} from '@/lib/orders/tracking';
import { sendTrackingNotificationEmail } from '@/lib/email/resend';
import { checkRateLimit } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

interface TrackingRequest {
  trackingNumber: string;
  carrier: CarrierCode;
  note?: string;
}

interface TrackingResponse {
  success: boolean;
  order: {
    id: string;
    trackingNumber: string;
    carrier: CarrierCode;
    trackingUrl: string | null;
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
  { params }: { params: { id: string } }
): Promise<NextResponse<TrackingResponse | ErrorResponse>> {
  // Rate limiting: general limit for admin routes
  const rateLimited = await checkRateLimit('general', request);
  if (rateLimited) return rateLimited as NextResponse<ErrorResponse>;

  try {
    const orderId = params.id;

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
    let body: TrackingRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // 4. Validate required fields
    if (!body.trackingNumber) {
      return NextResponse.json(
        { error: 'Missing required field: trackingNumber' },
        { status: 400 }
      );
    }

    if (!body.carrier) {
      return NextResponse.json(
        { error: 'Missing required field: carrier' },
        { status: 400 }
      );
    }

    // 5. Validate carrier code
    if (!isValidCarrier(body.carrier)) {
      return NextResponse.json(
        { error: 'Invalid carrier code. Must be one of: israel_post, dhl, fedex, ups, other' },
        { status: 400 }
      );
    }

    // 6. Validate tracking number format
    const validationResult = validateTrackingNumber(body.trackingNumber, body.carrier);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: validationResult.error || 'Invalid tracking number' },
        { status: 400 }
      );
    }

    // 7. Fetch existing order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, customer_email, customer_name')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // 8. Generate tracking URL
    const trackingUrl = generateTrackingUrl(body.trackingNumber, body.carrier);

    // 9. Update order in database
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        tracking_number: body.trackingNumber,
        carrier: body.carrier,
        tracking_url: trackingUrl,
        tracking_added_at: new Date().toISOString(),
        tracking_added_by: user.id,
        tracking_note: body.note,
        // Update status to shipped if not already
        status: order.status === 'printing' ? 'shipped' : order.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('id, tracking_number, carrier, tracking_url, updated_at')
      .single();

    if (updateError || !updatedOrder) {
      logger.error('Failed to update order', updateError);
      return NextResponse.json(
        { error: 'Failed to update order tracking' },
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
      const emailResult = await sendTrackingNotificationEmail({
        to: order.customer_email,
        customerName: order.customer_name,
        orderId: order.id,
        trackingNumber: body.trackingNumber,
        carrier: body.carrier,
        trackingUrl: trackingUrl,
      });

      notificationResult = {
        sent: emailResult.success,
        to: order.customer_email,
        error: emailResult.error,
      };
    } catch (emailError) {
      logger.error('Failed to send tracking email', emailError);
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
        trackingNumber: updatedOrder.tracking_number,
        carrier: updatedOrder.carrier as CarrierCode,
        trackingUrl: updatedOrder.tracking_url,
        updatedAt: updatedOrder.updated_at,
      },
      notification: notificationResult,
    });
  } catch (error) {
    logger.error('Tracking update error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
